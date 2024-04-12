import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Numeric } from '../../../../../../../../shared/modules/Numeric';
import {
  getConversionRate,
  getGasFeeEstimates,
  getNativeCurrency,
} from '../../../../../../../ducks/metamask/metamask';
import { EtherDenomination } from '../../../../../../../../shared/constants/common';
import {
  getCurrentCurrency,
  checkNetworkAndAccountSupports1559,
  getCurrentChainId,
  getIsSwapsChain,
} from '../../../../../../../selectors/selectors';
import {
  fetchAndSetSwapsGasPriceInfo,
  getUsedSwapsGasPrice,
} from '../../../../../../../ducks/swaps/swaps';
import { formatCurrency } from '../../../../../../../helpers/utils/confirm-tx.util';
import { toFixedNoTrailingZeros } from './utils';

export default function useEthFeeData(gasLimit = 0) {
  const dispatch = useDispatch();
  const nativeCurrencySymbol = useSelector(getNativeCurrency);

  const selectedNativeConversionRate = useSelector(getConversionRate);

  const currentCurrency = useSelector(getCurrentCurrency);

  const networkAndAccountSupports1559 = useSelector(
    checkNetworkAndAccountSupports1559,
  );
  const { medium } = useSelector(getGasFeeEstimates);

  const chainId = useSelector(getCurrentChainId);
  const isSwapsChain = useSelector(getIsSwapsChain);

  const gasPrice = useSelector(getUsedSwapsGasPrice);
  useEffect(() => {
    if (!isSwapsChain) {
      return;
    }

    if (!networkAndAccountSupports1559) {
      dispatch(fetchAndSetSwapsGasPriceInfo());
    }
  }, [dispatch, chainId, networkAndAccountSupports1559, isSwapsChain]);

  const { formattedEthGasFee, formattedFiatGasFee } = useMemo(() => {
    const ethGasFee = new Numeric(
      networkAndAccountSupports1559 ? medium?.suggestedMaxFeePerGas : gasPrice,
      10,
      EtherDenomination.GWEI,
    )
      .times(new Numeric(gasLimit, 10))
      .toDenomination(EtherDenomination.ETH);

    const fiatGasFee = ethGasFee
      .applyConversionRate(selectedNativeConversionRate)
      .toNumber();

    const formattedFiatGasFee = formatCurrency(
      new Numeric(fiatGasFee, 10).toString(),
      currentCurrency,
    );

    const formattedEthGasFee = `${toFixedNoTrailingZeros(
      ethGasFee.toNumber(),
    )} ${nativeCurrencySymbol}`;

    return { formattedFiatGasFee, formattedEthGasFee };
  }, [
    networkAndAccountSupports1559,
    medium?.suggestedMaxFeePerGas,
    gasPrice,
    gasLimit,
    selectedNativeConversionRate,
    currentCurrency,
    nativeCurrencySymbol,
  ]);

  return { formattedEthGasFee, formattedFiatGasFee };
}
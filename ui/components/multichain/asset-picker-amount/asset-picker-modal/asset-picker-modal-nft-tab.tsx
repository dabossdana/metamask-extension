/* eslint-disable no-nested-ternary */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import NftsItems from '../../../app/nfts-items/nfts-items';
import {
  Box,
  Text,
  ButtonLink,
  ButtonLinkSize,
} from '../../../component-library';
import {
  TextColor,
  TextVariant,
  TextAlign,
  Display,
  JustifyContent,
  AlignItems,
  FlexDirection,
} from '../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { getNftIsLoading } from '../../../../selectors';
import { TokenStandard } from '../../../../../shared/constants/transaction';
import ZENDESK_URLS from '../../../../helpers/constants/zendesk-url';
import LoadingScreen from '../../../ui/loading-screen';
import { detectNfts } from '../../../../store/actions';
import Spinner from '../../../ui/spinner';

type NFT = {
  address: string;
  description: string | null;
  favorite: boolean;
  image: string | null;
  isCurrentlyOwned: boolean;
  name: string | null;
  standard: TokenStandard;
  tokenId: string;
  tokenURI?: string;
};

type Collection = {
  collectionName: string;
  collectionImage: string | null;
  nfts: NFT[];
};

type AssetPickerModalNftTabProps = {
  collectionDataFiltered: Collection[];
  previouslyOwnedCollection: any;
};

export function AssetPickerModalNftTab({
  collectionDataFiltered,
  previouslyOwnedCollection,
}: AssetPickerModalNftTabProps) {
  const t = useI18nContext();
  const dispatch = useDispatch();

  const hasAnyNfts = Object.keys(collectionDataFiltered).length > 0;
  const isNftLoading = useSelector(getNftIsLoading);

  useEffect(() => {
    console.log('============');
    dispatch(detectNfts());
  }, []);

  if (isNftLoading) {
    // return <div className="nfts-tab__loading">{t('loadingNFTs')}</div>;
    //  return    <LoadingScreen />
    return (
      <Box className="modal-tab__loading">
        <Spinner
          color="var(--color-warning-default)"
          className="loading-overlay__spinner"
        />
      </Box>
    );
  }
  if (hasAnyNfts) {
    return (
      <Box className="modal-tab__main-view">
        <NftsItems
          collections={collectionDataFiltered}
          previouslyOwnedCollection={previouslyOwnedCollection}
          isModal={true}
          // onCloseModal={() => onClose()}
          showTokenId={true}
          displayPreviouslyOwnedCollection={false}
        />
      </Box>
    );
  }
  return (
    <Box
      padding={12}
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
      alignItems={AlignItems.center}
      justifyContent={JustifyContent.center}
    >
      <Box justifyContent={JustifyContent.center}>
        <img src="./images/no-nfts.svg" />
      </Box>
      <Box
        marginTop={4}
        marginBottom={12}
        display={Display.Flex}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.center}
        flexDirection={FlexDirection.Column}
        className="nfts-tab__link"
      >
        <Text
          color={TextColor.textMuted}
          variant={TextVariant.headingSm}
          textAlign={TextAlign.Center}
          as="h4"
        >
          {t('noNFTs')}
        </Text>
        <ButtonLink
          size={ButtonLinkSize.Sm}
          href={ZENDESK_URLS.NFT_TOKENS}
          externalLink
        >
          {t('learnMoreUpperCase')}
        </ButtonLink>
      </Box>
    </Box>
  );
}

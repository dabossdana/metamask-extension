import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { MetaMetricsContext } from '../../../../contexts/metametrics';
import {
  useEnableProfileSyncing,
  useDisableProfileSyncing,
} from '../../../../hooks/metamask-notifications/useProfileSyncing';
import {
  selectIsProfileSyncingEnabled,
  selectIsProfileSyncingUpdateLoading,
} from '../../../../selectors/metamask-notifications/profile-syncing';
import { selectParticipateInMetaMetrics } from '../../../../selectors/metamask-notifications/authentication';
import { showModal } from '../../../../store/actions';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../../shared/constants/metametrics';
import { Box, Text } from '../../../../components/component-library';
import ToggleButton from '../../../../components/ui/toggle-button';
import {
  Display,
  FlexDirection,
  JustifyContent,
  TextColor,
  TextVariant,
} from '../../../../helpers/constants/design-system';
import Preloader from '../../../../components/ui/icon/preloader/preloader-icon.component';

const ProfileSyncToggle = () => {
  const t = useI18nContext();
  const trackEvent = useContext(MetaMetricsContext);
  const dispatch = useDispatch();
  const { enableProfileSyncing, error: enableProfileSyncingError } =
    useEnableProfileSyncing();
  const { disableProfileSyncing, error: disableProfileSyncingError } =
    useDisableProfileSyncing();

  const error = enableProfileSyncingError || disableProfileSyncingError;

  const isProfileSyncingEnabled = useSelector(selectIsProfileSyncingEnabled);
  const participateInMetaMetrics = useSelector(selectParticipateInMetaMetrics);
  const isProfileSyncingUpdateLoading = useSelector(
    selectIsProfileSyncingUpdateLoading,
  );

  const handleUseProfileSync = async () => {
    if (isProfileSyncingEnabled) {
      dispatch(
        showModal({
          name: 'CONFIRM_TURN_OFF_PROFILE_SYNCING',
          turnOffProfileSyncing: () => {
            disableProfileSyncing();
            trackEvent({
              category: MetaMetricsEventCategory.Settings,
              event: MetaMetricsEventName.TurnOffProfileSyncing,
              properties: {
                participateInMetaMetrics,
              },
            });
          },
        }),
      );
    } else {
      await enableProfileSyncing();
      trackEvent({
        category: MetaMetricsEventCategory.Settings,
        event: MetaMetricsEventName.TurnOnProfileSyncing,
        properties: {
          isProfileSyncingEnabled,
          participateInMetaMetrics,
        },
      });
    }
  };

  return (
    <Box>
      <Box
        className="settings-page__content-row"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        gap={4}
        data-testid="profileSyncToggle"
      >
        <div className="settings-page__content-item" id="profileSyncLabel">
          <span>{t('profileSync')}</span>
          <div
            className="settings-page__content-description"
            data-testid="profileSyncDescription"
          >
            {t('profileSyncDescription', [
              <a
                href="https://consensys.io/privacy-policy/"
                key="link"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="privacyPolicyLink"
              >
                {t('profileSyncPrivacyLink')}
              </a>,
            ])}
          </div>
        </div>

        {isProfileSyncingUpdateLoading && (
          <Box paddingLeft={5} paddingRight={5}>
            <Preloader size={36} />
          </Box>
        )}

        {!isProfileSyncingUpdateLoading && (
          <div className="settings-page__content-item-col">
            <ToggleButton
              value={isProfileSyncingEnabled}
              onToggle={handleUseProfileSync}
              offLabel={t('off')}
              onLabel={t('on')}
              dataTestId="toggleButton"
            />
          </div>
        )}
      </Box>
      {error && (
        <Box paddingBottom={4}>
          <Text
            as="p"
            color={TextColor.errorDefault}
            variant={TextVariant.bodySm}
          >
            {t('notificationsSettingsBoxError')}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default ProfileSyncToggle;

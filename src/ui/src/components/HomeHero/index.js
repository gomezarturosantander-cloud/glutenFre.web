import React, { useState, useEffect } from 'react'
import { useTheme } from 'styled-components'
import {
  HeroContainer,
  ContentWrapper,
  WrapInput,
  LogoWrapper,
  LogoBadgeRow,
  BadgeWrapper,
  DeliveryContextRow,
  UseAccount,
  HeroContent,
  SectionHeader
} from './styles'
import { useSession } from '~components/contexts/SessionContext'
import { useOrder } from '~components/contexts/OrderContext'
import { useLanguage } from '~components/contexts/LanguageContext'

import { Modal } from '~ui/src/components/Modal'
import { Button } from '~ui/src/styles/Buttons'
import { AddressForm } from '~ui/src/components/AddressForm'
import { LoginForm } from '~ui/src/components/LoginForm'
import { SignUpForm } from '~ui/src/components/SignUpForm'
import { ForgotPasswordForm } from '~ui/src/components/ForgotPasswordForm'
import { AddressList } from '~ui/src/components/AddressList'
import { AddressOrderType } from '~ui/src/components/AddressOrderType'
import { useWindowSize } from '~ui/hooks/useWindowSize'
import { getSiteLogoUrl } from '~/utils/siteBranding'
import glutenFreLogo from '~/assets/images/logotype-glutenfre.svg'
import glutenFreBadge from '~/assets/images/badge-sin-gluten.svg'

import { Icon } from '~ui-icon'

// Delay before auto-prompting a logged-in user for an address. Lets the
// post-login order-options refresh settle (a brief `loading` flicker resolves
// the saved address) so the "Add address" modal doesn't flash. See .
const ADDRESS_PROMPT_SETTLE_MS = 1500

export const HomeHero = (props) => {
  const { onFindBusiness, notificationState, urlLocation } = props

  const [{ auth, loading: sessionLoading }, { login }] = useSession()
  const [orderState] = useOrder()
  const [, t] = useLanguage()
  const [modals, setModals] = useState({ listOpen: false, formOpen: false })
  const theme = useTheme()
  const userCustomer = parseInt(window.localStorage.getItem('user-customer'))
  const windowSize = useWindowSize()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [modalPageToShow, setModalPageToShow] = useState(null)
  const [newAddressModalOpened, setNewAddressModalOpened] = useState(false)
  const [addressFormLoading, setAddressFormLoading] = useState(false)

  const isShowLoginAccount = !theme?.mobile_view_web?.components?.home?.components?.login_account?.hidden
  const bgImg = theme?.my_products?.components?.images?.components?.homepage_background?.components?.image
  const mobileBgImg = theme?.my_products?.components?.images?.components?.homepage_mobile_background?.components?.image
  const isFullScreen =
    theme?.my_products?.components?.images?.components?.homepage_image_fullscreen ??
    theme?.layouts?.my_products?.components?.images?.components?.homepage_image_fullscreen ??
    false
  const handleFindBusinesses = () => {
    if (!orderState?.options?.address?.location && !urlLocation) {
      setModals({ ...modals, formOpen: true })
      return
    }
    setModals({ listOpen: false, formOpen: false })
    onFindBusiness && onFindBusiness()
  }

  /* const handleAddressInput = () => {
    if (auth) {
      setModals({ ...modals, listOpen: true })
    } else {
      setModals({ ...modals, formOpen: true })
    }
  } */

  const handleOpenLoginSignUp = (index) => {
    setModalPageToShow(index)
    setAuthModalOpen(true)
  }

  const handleCustomModalClick = (e, { page }) => {
    e.preventDefault()
    setModalPageToShow(page)
  }

  const closeAuthModal = () => {
    setAuthModalOpen(false)
    setModalPageToShow(null)
  }

  const handleSuccessLogin = (user) => {
    if (user) {
      closeAuthModal()
    }
  }

  const handleSuccessSignup = (user) => {
    login({
      user,
      token: user?.session?.access_token
    })
  }

  useEffect(() => {
    return () => setModals({ listOpen: false, formOpen: false })
  }, [])

  useEffect(() => {
    if (newAddressModalOpened) return
    if (!(auth && !sessionLoading && !orderState.loading && !orderState?.options?.address?.location)) return
    // Defer the prompt: after login the order options refresh and `loading`
    // briefly flickers to false before the saved address resolves. If the
    // address arrives during the settle window this effect re-runs and the
    // cleanup clears the timer, so existing users never see the flash;
    // genuinely address-less users still get prompted once it elapses.
    const timer = setTimeout(() => {
      setModals(prev => ({ ...prev, formOpen: true }))
      setNewAddressModalOpened(true)
    }, ADDRESS_PROMPT_SETTLE_MS)
    return () => clearTimeout(timer)
  }, [auth, orderState, sessionLoading, newAddressModalOpened])

  return (
    <HeroContainer
      mb={!auth && isShowLoginAccount && '30vh'}
      bgimage={windowSize.width < 576 ? mobileBgImg : bgImg}
      isFullScreen={isFullScreen}
    >
      <ContentWrapper>
        <LogoBadgeRow>
          <LogoWrapper>
            <img
              alt='Logotype'
              src={getSiteLogoUrl(
                theme?.my_products?.components?.images?.components?.logo?.components?.image,
                glutenFreLogo
              )}
              loading='lazy'
            />
          </LogoWrapper>
          <BadgeWrapper>
            <img alt='Sin Gluten' src={glutenFreBadge} loading='lazy' />
          </BadgeWrapper>
        </LogoBadgeRow>
        <HeroContent>
          <div className='input-wrapper'>
            <WrapInput onClick={handleFindBusinesses} $withIcon>
              <Icon name="search" />
              <p>
                {orderState?.options?.address?.address || t('WHERE_DO_WE_DELIVER_2', theme?.defaultLanguages?.WHERE_DO_WE_DELIVER_2 || 'Enter where you want your order delivered.')}
              </p>
            </WrapInput>
          </div>
          {/* La barra de Entrega/Levantar + dirección del Header se oculta en
          Home (ver Header/index.js, hideHomeOrderContext) porque el diseño no
          la contempla arriba de todo. Se reubica acá, chica y discreta, sin
          sacarla de la lógica real (mismo componente AddressOrderType). */}
          <DeliveryContextRow>
            <AddressOrderType />
          </DeliveryContextRow>
        </HeroContent>
      </ContentWrapper>

      {windowSize.width < 576 && !auth && isShowLoginAccount && (
        <UseAccount>
          <SectionHeader>
            {t('YOUR_ACCOUNT', 'Use your account')}
          </SectionHeader>
          <Button color='primary' onClick={() => handleOpenLoginSignUp('login')}>{t('LOGIN', 'login')}</Button>
          <Button color='primary' onClick={() => handleOpenLoginSignUp('signup')}>{t('SIGNUP', 'signUp')}</Button>
        </UseAccount>
      )}
      {modals.formOpen && (
        <Modal
          title={auth ? t('ADD_ADDRESS_TITLE', theme?.defaultLanguages?.ADD_ADDRESS_TITLE || 'Add address') : t('GUEST', theme?.defaultLanguages?.GUEST || 'Guest')}
          open={modals.formOpen}
          onClose={() => {
            if (addressFormLoading) return
            setModals({ ...modals, formOpen: false })
          }}
          /* padding='30px 20px 0px' */
        >
          <AddressForm
            useValidationFileds
            createGuestOnSave={!auth}
            onLoadingChange={setAddressFormLoading}
            address={orderState?.options?.address || {}}
            onClose={() => {
              if (addressFormLoading) return
              setModals({ ...modals, formOpen: false })
            }}
            onSaveAddress={() => {
              setModals({ listOpen: false, formOpen: false })
              onFindBusiness && onFindBusiness()
            }}
            onCancel={() => {
              if (addressFormLoading) return
              setModals({ ...modals, formOpen: false })
            }}
          />
        </Modal>
      )}
      {modals.listOpen && (
        <Modal
          title={t('WHERE_DO_WE_DELIVERY', theme?.defaultLanguages?.WHERE_DO_WE_DELIVERY || 'Where do we deliver?')}
          open={modals.listOpen}
          width='70%'
          onClose={() => setModals({ ...modals, listOpen: false })}
        >
          <AddressList
            isModal
            changeOrderAddressWithDefault
            userId={isNaN(userCustomer) ? null : userCustomer}
            onCancel={() => setModals({ ...modals, listOpen: false })}
            onAccept={() => handleFindBusinesses()}
          />
        </Modal>
      )}
      {authModalOpen && !auth && (
        <Modal
          open={authModalOpen}
          onRemove={() => closeAuthModal()}
          width='50%'
          authModal
        >
          {modalPageToShow === 'login' && (
            <LoginForm
              notificationState={notificationState}
              handleSuccessLogin={handleSuccessLogin}
              elementLinkToSignup={
                <a
                  onClick={
                    (e) => handleCustomModalClick(e, { page: 'signup' })
                  } href='#'
                >{t('CREATE_ACCOUNT', theme?.defaultLanguages?.CREATE_ACCOUNT || 'Create account')}
                </a>
              }
              elementLinkToForgotPassword={
                <a
                  onClick={
                    (e) => handleCustomModalClick(e, { page: 'forgotpassword' })
                  } href='#'
                >{t('RESET_PASSWORD', theme?.defaultLanguages?.RESET_PASSWORD || 'Reset password')}
                </a>
              }
              useLoginByCellphone
              isPopup
            />
          )}
          {modalPageToShow === 'signup' && (
            <SignUpForm
              notificationState={notificationState}
              elementLinkToLogin={
                <a
                  onClick={
                    (e) => handleCustomModalClick(e, { page: 'login' })
                  } href='#'
                >{t('LOGIN', theme?.defaultLanguages?.LOGIN || 'Login')}
                </a>
              }
              useLoginByCellphone
              useChekoutFileds
              handleSuccessSignup={handleSuccessSignup}
              isPopup
            />
          )}
          {modalPageToShow === 'forgotpassword' && (
            <ForgotPasswordForm
              elementLinkToLogin={
                <a
                  onClick={
                    (e) => handleCustomModalClick(e, { page: 'login' })
                  } href='#'
                >{t('LOGIN', theme?.defaultLanguages?.LOGIN || 'Login')}
                </a>
              }
              isPopup
            />
          )}
        </Modal>
      )}
    </HeroContainer>
  )
}

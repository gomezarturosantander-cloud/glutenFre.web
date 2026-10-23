import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from 'styled-components'
import settings from '../../../../config'
import {
  Header as HeaderContainer,
  InnerHeader,
  LogoHeader,
  LeftHeader,
  RightHeader,
  Menu,
  MenuLink,
  SubMenu,
  CustomerInfo,
  UserEdit,
  AddressMenu,
  MomentMenu,
  FarAwayMessage,
  AddressWrapper,
  Divider,
  AddressFormWrapper,
  LanguageSelectorWrapper,
  LeftSide,
  AddressOrderTypeContainer,
  PinMapWrapper,
  AddressMapInfoWrapper
} from './styles'

import { useSession } from '~components/contexts/SessionContext'
import { useLanguage } from '~components/contexts/LanguageContext'
import { useOrder } from '~components/contexts/OrderContext'
import { useEvent } from '~components/contexts/EventContext'
import { useConfig } from '~components/contexts/ConfigContext'
import { useCustomer } from '~components/contexts/CustomerContext'
import { useUtils } from '~components/contexts/UtilsContext'
import { useBusiness } from '~components/contexts/BusinessContext'
import loadable from '@loadable/component'
import { LanguageSelector } from '~ui/src/components/LanguageSelector'
import { useWindowSize } from '~ui/hooks/useWindowSize'
import { useOnlineStatus } from '~ui/hooks/useOnlineStatus'
import { getDistance, getCateringValues } from '~ui/utils'
import { Confirm } from '~ui/src/components/Confirm'
import { Modal } from '~ui/src/components/Modal'
import { Button } from '~ui/src/styles/Buttons'
import { OrderTypeSelectorContent } from '~ui/src/components/OrderTypeSelectorContent'
import { HeaderOption } from '~ui/src/components/HeaderOption'
import { AddressOrderType } from '~ui/src/components/AddressOrderType'
import { getUtils } from './utils'
import { getSiteLogoUrl } from '~/utils/siteBranding'

import { Icon } from '~ui-icon'

// Popover/modal contents open on interaction — lazy so their vendor trees
// (swiper via Cart/ProductForm, maps + phone metadata via AddressForm,
// firebase via LoginForm, datepickers via MomentContent/BusinessPreorder)
// stay out of the entry chunk.
const CartPopover = loadable(() => import('~ui/src/components/CartPopover').then((m) => m.CartPopover))
const CartContent = loadable(() => import('~ui/src/components/CartContent').then((m) => m.CartContent))
const MomentContent = loadable(() => import('~ui/src/components/MomentContent').then((m) => m.MomentContent))
const AddressList = loadable(() => import('~ui/src/components/AddressList').then((m) => m.AddressList))
const AddressForm = loadable(() => import('~ui/src/components/AddressForm').then((m) => m.AddressForm))
const SidebarMenu = loadable(() => import('~ui/src/components/SidebarMenu').then((m) => m.SidebarMenu))
const UserDetails = loadable(() => import('~ui/src/components/UserDetails').then((m) => m.UserDetails))
const LoginForm = loadable(() => import('~ui/src/components/LoginForm').then((m) => m.LoginForm))
const SignUpForm = loadable(() => import('~ui/src/components/SignUpForm').then((m) => m.SignUpForm))
const ForgotPasswordForm = loadable(() => import('~ui/src/components/ForgotPasswordForm').then((m) => m.ForgotPasswordForm))
const BusinessPreorder = loadable(() => import('~ui/src/components/BusinessPreorder').then((m) => m.BusinessPreorder))

export const Header = (props) => {
  const {
    location,
    isHome,
    isHideSignup,
    isCustomerMode,
    businessSlug,
    notificationState,
    singleBusinessConfig,
    logoHomeTarget,
    isTrackingOnly
  } = props

  const isSingleBusiness = !!singleBusinessConfig?.isActive
  const { pathname } = useLocation()
  const [events] = useEvent()
  const [{ parseDate, timeFormat, preorderDateFormat, getMaxPreorderDays }] = useUtils()
  const [, t] = useLanguage()
  const [{ auth, user }, { login }] = useSession()
  const [orderState, { refreshOrderOptions }] = useOrder()
  const [openPopover, setOpenPopover] = useState({})
  const theme = useTheme()
  const websiteThemeType = theme?.my_products?.components?.website_theme?.components?.type
  const websiteThemeBusinessSlug = theme?.my_products?.components?.website_theme?.components?.business_slug
  const websiteThemeFranchiseSlug = theme?.my_products?.components?.website_theme?.components?.franchise_slug
  const isSingleStoreTheme = websiteThemeType === 'single_store' && websiteThemeBusinessSlug
  const isFranchise = (websiteThemeType === 'franchise' && websiteThemeFranchiseSlug) || settings?.franchiseSlug
  const [configState] = useConfig()
  const maxPreorderDays = getMaxPreorderDays(orderState.options?.type)
  const isPreorderDisabled = maxPreorderDays === -1 || maxPreorderDays === 0
  const [customerState, { deleteUserCustomer }] = useCustomer()
  const [{ business }] = useBusiness()
  const { AddressMapIcon } = getUtils()
  const updatedBusinessSlug = (websiteThemeType === 'single_store' && websiteThemeBusinessSlug) || settings?.businessSlug
  const hideMapIcon = !!updatedBusinessSlug
  const clearCustomer = useRef(null)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [customerModalOpen, setCustomerModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [modalSelected, setModalSelected] = useState(null)
  const [modalPageToShow, setModalPageToShow] = useState(null)
  const [preorderBusiness, setPreorderBusiness] = useState(null)
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)
  const [isOpenUserData, setIsOpenUserData] = useState(false)
  const [confirm, setConfirm] = useState({ open: false, content: null, handleOnAccept: null })
  const [isFarAway, setIsFarAway] = useState(false)
  const [activeCartUuid, setActiveCartUuid] = useState(null)

  const isMulticheckoutPage = window.location.pathname?.includes('/multi-checkout')

  const cartsWithProducts = (orderState?.carts && Object.values(orderState?.carts).filter(cart => (cart.products && cart.products?.length > 0) || cart?.reservation)) || null
  const carts = businessSlug
    ? cartsWithProducts.filter((cart) => cart?.business?.slug === businessSlug || businessSlug === cart?.business_id)
    : cartsWithProducts

  const windowSize = useWindowSize()
  const onlineStatus = useOnlineStatus()

  const userCustomer = JSON.parse(window.localStorage.getItem('user-customer'))

  const configTypes = configState?.configs?.order_types_allowed?.value.split('|').map(value => Number(value)) || []
  const isPreOrderSetting = configState?.configs?.preorder_status_enabled?.value === '1'
  const isHideLanguages = theme?.header?.components?.language_selector?.hidden
  const cateringTypeString = orderState?.options?.type === 7
    ? 'catering_delivery'
    : orderState?.options?.type === 8
      ? 'catering_pickup'
      : null

  const cateringValues = getCateringValues(cateringTypeString, pathname.includes('store') && Object?.keys(business || {})?.length > 0 ? business?.configs : configState?.configs)

  const hasSavedAddressContext = Boolean(
    orderState?.options?.address || orderState?.options?.address_id
  )

  // glutenfre: el diseño del Home no contempla la barra de Entrega/Levantar +
  // dirección arriba de todo (ver designs/02-inicio-comidas.png) — se oculta
  // siempre en Home, con o sin dirección guardada, y se reubica chica y
  // discreta dentro de HomeHero (ver HomeHero/index.js).
  const hideHomeOrderContext = isHome

  const handleSuccessSignup = (user) => {
    closeAuthModal()
    login({
      user,
      token: user?.session?.access_token
    })
  }

  const handleClickUserCustomer = (e) => {
    const isActionsClick = clearCustomer.current?.contains(e?.target)
    if (isActionsClick) {
      setConfirm({
        open: true,
        content: t('QUESTION_CLEAR_CUSTOMER', theme?.defaultLanguages?.QUESTION_CLEAR_CUSTOMER || 'Are you sure that you want to clear the customer?'),
        handleOnAccept: () => {
          deleteUserCustomer(true)
          refreshOrderOptions()
          handleGoToPage({ page: 'home' })
          setConfirm({ ...confirm, open: false })
        }
      })
      return
    }
    setCustomerModalOpen(true)
  }

  const openModal = (opt) => {
    setModalSelected(opt)
    setModalIsOpen(true)
  }

  const handleTogglePopover = (type) => {
    setOpenPopover({
      ...openPopover,
      [type]: !openPopover[type]
    })
  }

  const handleClosePopover = (type) => {
    setOpenPopover({
      ...openPopover,
      [type]: false
    })
  }

  const handleGoToPage = (data) => {
    events.emit('go_to_page', data)
    if (isCustomerMode && pathname.includes('/orders')) {
      deleteUserCustomer(true)
      refreshOrderOptions()
    }
  }

  const handleCustomModalClick = (e, { page }) => {
    e.preventDefault()
    setModalPageToShow(page)
  }

  const closeAuthModal = () => {
    setAuthLoading(false)
    setAuthModalOpen(false)
    setModalPageToShow(null)
  }

  const handleSuccessLogin = (user) => {
    if (user) {
      closeAuthModal()
    }
  }

  const handleOpenLoginSignUp = (index) => {
    if (isCustomerMode) {
      events.emit('go_to_page', { page: 'home' })
    } else {
      setModalPageToShow(index)
      setAuthModalOpen(true)
    }
  }

  const handleClosePreorder = () => {
    setPreorderBusiness(null)
  }

  const handleBusinessClick = (business) => {
    events.emit('go_to_page', { page: 'business', params: { store: business.slug } })
  }

  const handleLogoClick = () => {
    if (isTrackingOnly) {
      handleGoToPage({ page: 'home' })
      return
    }
    if (isFranchise) {
      window.localStorage.setItem('change_store_redirect', 'true')
      window.localStorage.removeItem('single_business')
    }
    if (isSingleStoreTheme) {
      handleGoToPage({ page: 'business', params: { business_slug: websiteThemeBusinessSlug } })
      return
    }
    handleGoToPage(logoHomeTarget || { page: 'home' })
  }

  useEffect(() => {
    const handleProductAdded = (product, cart) => {
      setActiveCartUuid(cart?.uuid)
    }
    const handleProductUpdated = (product, cart) => {
      setActiveCartUuid(cart?.uuid)
    }
    const handleCartPopoverClosed = () => {
      setActiveCartUuid(null)
    }
    const handleRequireOrderAddress = () => {
      openModal('address')
    }
    events.on('cart_product_added', handleProductAdded)
    events.on('cart_product_updated', handleProductUpdated)
    events.on('cart_popover_closed', handleCartPopoverClosed)
    events.on('require_order_address', handleRequireOrderAddress)
    return () => {
      events.off('cart_product_added', handleProductAdded)
      events.off('cart_product_updated', handleProductUpdated)
      events.off('cart_popover_closed', handleCartPopoverClosed)
      events.off('require_order_address', handleRequireOrderAddress)
    }
  }, [])

  const handleCloseCartModal = () => {
    setActiveCartUuid(null)
    setModalIsOpen(false)
  }

  useEffect(() => {
    if (isCustomerMode) {
      setCustomerModalOpen(false)
    }
  }, [customerState?.user?.address])

  useEffect(() => {
    if (!(pathname.includes('/search') || pathname.includes('/checkout'))) {
      setIsFarAway(false)
      return
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      const crd = pos.coords
      const distance = getDistance(crd.latitude, crd.longitude, orderState?.options?.address?.location?.lat, orderState?.options?.address?.location?.lng)
      if (distance > 20) setIsFarAway(true)
      else setIsFarAway(false)
    }, (err) => {
      console.warn(`ERROR(${err.code}): ${err.message}`)
    }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    })
  }, [orderState?.options?.address?.location, pathname])

  const apiLogo = theme?.my_products?.components?.images?.components?.logo?.components?.image
  const apiLogoMobile = theme?.my_products?.components?.images?.components?.logo_mobile?.components?.image
  const isMobileLogo = windowSize.width <= 768
  const logotypeSrc = getSiteLogoUrl(apiLogo, theme?.images?.logos?.logotype)
  const isotypeSrc = getSiteLogoUrl(
    isMobileLogo ? apiLogoMobile : apiLogo,
    isMobileLogo ? theme?.images?.logos?.isotypeInvert : theme?.images?.logos?.isotype
  )

  if (isTrackingOnly) {
    return (
      <HeaderContainer>
        <InnerHeader>
          <LeftSide>
            <LeftHeader id='left-side'>
              <LogoHeader onClick={handleLogoClick}>
                {logotypeSrc && (
                  <img
                    alt='Logotype'
                    width='170px'
                    height='45px'
                    src={logotypeSrc}
                    loading='lazy'
                  />
                )}
                {isotypeSrc && (
                  <img
                    alt='Isotype'
                    width='35px'
                    height='45px'
                    loading='lazy'
                    src={isotypeSrc}
                  />
                )}
              </LogoHeader>
            </LeftHeader>
          </LeftSide>
        </InnerHeader>
      </HeaderContainer>
    )
  }

  return (
    <HeaderContainer>
      <InnerHeader>
        <LeftSide>
          <LeftHeader id='left-side'>
            <SidebarMenu
              notificationState={notificationState}
              auth={auth}
              isHideSignup={isHideSignup}
              userCustomer={userCustomer ?? user}
              isCustomerMode={isCustomerMode}
              logoHomeTarget={logoHomeTarget}
            />
            <LogoHeader
              onClick={handleLogoClick}
            >
              {logotypeSrc && (
                <img
                  alt='Logotype'
                  width='170px'
                  height='45px'
                  src={logotypeSrc}
                  loading='lazy'
                />
              )}
              {isotypeSrc && (
                <img
                  alt='Isotype'
                  width='35px'
                  height='45px'
                  loading='lazy'
                  src={isotypeSrc}
                />
              )}
            </LogoHeader>
          </LeftHeader>

          {windowSize.width >= 576 && !hideHomeOrderContext && !['/signup_business', '/signup-driver'].includes(location.pathname) && (
            <Menu id='center-side' className='left-header' isCustomerMode={isCustomerMode}>
              <AddressOrderTypeContainer>
                <AddressOrderType />
              </AddressOrderTypeContainer>
              {isCustomerMode && (
                <>
                  <AddressWrapper>
                    {windowSize.width > 850 && isFarAway && (
                      <FarAwayMessage>
                        <Icon name="caretUpFill" />
                        <span>{t('YOU_ARE_FAR_FROM_ADDRESS_INFO', 'Is this the right address? It seems like you\'re a bit far away.')}</span>
                      </FarAwayMessage>
                    )}
                    <AddressMenu
                      isCustomerMode={isCustomerMode}
                      onClick={(e) => handleClickUserCustomer(e)}
                    >
                      <Icon name="mapMarker" />
                      <span>{orderState.options?.address?.address || t('LANG_WHAT_IS_YOUR_ADDRESS', 'What\'s your address?')}</span>
                    </AddressMenu>
                  </AddressWrapper>
                  <Divider />
                </>
              )}
              {isCustomerMode && windowSize.width > 450 && (
                <>
                  <CustomerInfo
                    onClick={(e) => handleClickUserCustomer(e)}
                  >
                    <span>
                      <p>{userCustomer?.name} {userCustomer?.lastname}</p>
                    </span>
                    <span
                      ref={clearCustomer}
                    >
                      <Icon name="close" />
                    </span>
                  </CustomerInfo>
                  <Divider />
                </>
              )}
              {onlineStatus && windowSize.width > 820 && (
                <>
                  {!isCustomerMode && (isPreOrderSetting || configState?.configs?.preorder_status_enabled?.value === undefined) && (
                    <MomentMenu
                      onClick={isPreorderDisabled
                        ? null
                        : () => openModal('moment')}
                    >
                      <div>
                        {orderState.options?.moment
                          ? parseDate(orderState.options?.moment, { outputFormat: `${preorderDateFormat} ${timeFormat}` })
                          : t('ASAP_ABBREVIATION', 'ASAP')}
                        <Icon name="chevronDown" className='dropdown-arrow' />
                      </div>
                    </MomentMenu>
                  )}
                  {!isCustomerMode && (
                    <AddressWrapper>
                      {windowSize.width > 850 && isFarAway && (
                        <FarAwayMessage>
                          <Icon name="caretUpFill" />
                          <span>{t('YOU_ARE_FAR_FROM_ADDRESS_INFO', 'Is this the right address? It seems like you\'re a bit far away.')}</span>
                        </FarAwayMessage>
                      )}
                      <AddressMenu
                        onClick={() => openModal('address')}
                      >
                        <Icon name="mapMarker" />
                        <span>
                          <p>
                            {orderState.options?.address?.address || t('WHAT_IS_YOUR_ADDRESS', 'What\'s your address?')}
                          </p>
                        </span>
                      </AddressMenu>
                    </AddressWrapper>
                  )}
                </>
              )}
            </Menu>
          )}
        </LeftSide>
        {onlineStatus && (
          <RightHeader id='right-side'>
            <Menu isCustomerMode={isCustomerMode}>
              {!hideMapIcon && windowSize.width > 768 && !hideHomeOrderContext && !['/signup_business', '/signup-driver'].includes(location.pathname) && window.location.search !== '?view=map' && (
                <PinMapWrapper onClick={() => openModal('address-map')}>
                  <Icon name="pinMapFill" />
                </PinMapWrapper>
              )}
              {
                !auth && windowSize.width > 920 && (
                  <>
                    <MenuLink
                      name='signin'
                      style={{ whiteSpace: 'nowrap' }}
                      onClick={() => handleOpenLoginSignUp('login')}
                    >
                      {t('LOGIN', theme?.defaultLanguages?.LOGIN || 'Login')}
                    </MenuLink>
                    {!isHideSignup && (
                      <Button
                        type='button'
                        color='primary'
                        name='signup'
                        className='signup-button'
                        onClick={() => handleOpenLoginSignUp('signup')}
                      >
                        {t('SIGN_UP', theme?.defaultLanguages?.SIGN_UP || 'Sign up')}
                      </Button>
                    )}
                  </>
                )
              }
              {
                auth && (
                  <>
                    {windowSize.width > 768
                      ? !isMulticheckoutPage
                          ? <CartPopover
                              open={openPopover.cart}
                              carts={carts}
                              onClick={() => handleTogglePopover('cart')}
                              onClose={() => handleClosePopover('cart')}
                              auth={auth}
                              location={location}
                              isCustomerMode={isCustomerMode}
                              setPreorderBusiness={setPreorderBusiness}
                            />
                          : null
                      : (
                        <>
                          {!hideMapIcon && !hideHomeOrderContext && !['/signup_business', '/signup-driver'].includes(location.pathname) && window.location.search !== '?view=map' && (
                            <PinMapWrapper onClick={() => openModal('address-map')}>
                              <Icon name="pinMapFill" />
                            </PinMapWrapper>
                          )}
                          <HeaderOption
                            variant='cart'
                            totalCarts={carts?.length}
                            onClick={(variant) => openModal(variant)}
                          />
                        </>
                        )
                    }
                  </>
                )
              }
              {!isHideLanguages && (
                <LanguageSelectorWrapper>
                  <LanguageSelector />
                </LanguageSelectorWrapper>
              )}
            </Menu>
          </RightHeader>
        )}
      </InnerHeader>
      {onlineStatus && !props.isCustomLayout && !isCustomerMode && !hideHomeOrderContext && (
        windowSize.width > 768 && windowSize.width <= 820
          ? (
            <SubMenu>
              {!isCustomerMode && (isPreOrderSetting || configState?.configs?.preorder_status_enabled?.value === undefined) && (
                <HeaderOption
                  variant='moment'
                  momentState={orderState?.options?.moment}
                  onClick={isPreorderDisabled
                    ? null
                    : (variant) => openModal(variant)}
                />
              )}
              <AddressWrapper>
                {isFarAway && (
                  <FarAwayMessage>
                    <Icon name="caretUpFill" />
                    <span>{t('YOU_ARE_FAR_FROM_ADDRESS_INFO', 'Is this the right address? It seems like you\'re a bit far away.')}</span>
                  </FarAwayMessage>
                )}
                <AddressMenu onClick={() => openModal('address')}>
                  <Icon name="mapMarker" /> {orderState.options?.address?.address || t('WHAT_IS_YOUR_ADDRESS', 'What\'s your address?')}
                </AddressMenu>
              </AddressWrapper>
            </SubMenu>
            )
          : (
              windowSize.width >= 576 && (
              <SubMenu>
                {!isCustomerMode && (isPreOrderSetting || configState?.configs?.preorder_status_enabled?.value === undefined) && (
                  <HeaderOption
                    variant='moment'
                    momentState={orderState?.options?.moment}
                    onClick={isPreorderDisabled
                      ? null
                      : (variant) => openModal(variant)}
                  />
                )}
                <AddressWrapper style={{ width: '80%' }}>
                  {isFarAway && (
                    <FarAwayMessage>
                      <Icon name="caretUpFill" />
                      <span>{t('YOU_ARE_FAR_FROM_ADDRESS_INFO', 'Is this the right address? It seems like you\'re a bit far away.')}</span>
                    </FarAwayMessage>
                  )}
                  <HeaderOption
                    variant='address'
                    addressState={orderState?.options?.address?.address}
                    onClick={(variant) => openModal(variant)}
                    containerStyle={{ width: '100%' }}
                  />
                </AddressWrapper>
              </SubMenu>
              )
            )
      )}
      {modalIsOpen && (
        <Modal
          {...((!auth || !hasSavedAddressContext) && modalSelected === 'address' && { title: t('WHAT_IS_YOUR_ADDRESS', 'What\'s your address?'), titleStyle: { marginBottom: '0px' } })}
          open={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
          width={modalSelected === 'address' ? orderState?.options?.user_id ? '70%' : '50%' : '700px'}
        >
          {modalSelected === 'cart' && (
            <CartContent
              isCartPopover
              carts={carts}
              isOrderStateCarts={!!orderState.carts}
              onClose={handleCloseCartModal}
              activeCartUuid={activeCartUuid}
              onActiveCartChange={setActiveCartUuid}
            />
          )}
          {modalSelected === 'address-map' && (
            <AddressMapInfoWrapper>
              <div className='address-map-icon'>
                <AddressMapIcon />
              </div>
              <div className='address-map-info'>
                <h2>{t('ADDRESS_MAP_TITLE', 'Discover your neighborhood with the new map')}</h2>
                <p>{t('ADDRESS_MAP_SUBTITLE', 'The new Map can help you discover the best stores wherever you are. Give it a try.')}</p>
                <div className='address-map-info-item'>
                  <Icon name="locationFood" />
                  <p>{t('ADDRESS_MAP_DESCRIPTION_1', 'Discover restaurants, coffee shops, groceries and more')}</p>
                </div>
                <div className='address-map-info-item'>
                  <Icon name="geoAltFill" />
                  <p>{t('ADDRESS_MAP_DESCRIPTION_2', 'Tap on a map pin to show popular menu items')}</p>
                </div>
                <div className='address-map-info-item'>
                  <Icon name="searchBs" />
                  <p>{t('ADDRESS_MAP_DESCRIPTION_3', 'Search directly on the map to find stores around you')}</p>
                </div>
                <div className='explore-button'>
                  <Button
                    color='primary'
                    onClick={() => {
                      events.emit('go_to_page', { page: 'business_search', search: '?view=map' })
                      setModalIsOpen(false)
                    }}
                  >
                    {t('EXPLORE', 'Explore')}
                  </Button>
                </div>
              </div>
            </AddressMapInfoWrapper>
          )}
          {modalSelected === 'address' && (
            auth && hasSavedAddressContext
              ? (
                <AddressList
                  isModal
                  changeOrderAddressWithDefault
                  userId={isNaN(userCustomer?.id) ? null : userCustomer?.id}
                  onCancel={() => setModalIsOpen(false)}
                  isCustomerMode={isCustomerMode}
                />
                )
              : (
                <AddressFormWrapper>
                  <AddressForm
                    useValidationFileds
                    address={orderState?.options?.address || {}}
                    onCancel={() => setModalIsOpen(false)}
                    onSaveAddress={() => setModalIsOpen(false)}
                    isCustomerMode={isCustomerMode}
                  />
                </AddressFormWrapper>
                )
          )}
          {modalSelected === 'moment' && (
            <MomentContent
              onClose={() => setModalIsOpen(false)}
              cateringPreorder={!!cateringTypeString}
              isHeader
              business={(pathname.includes('store') && business) || isSingleBusiness}
              {...cateringValues}
            />
          )}
          {modalSelected === 'delivery' && (
            <OrderTypeSelectorContent
              onClose={() => setModalIsOpen(false)}
              configTypes={!configState?.loading && configTypes?.length > 0 ? configTypes : null}
              defaultValue={!(!configState?.loading && configTypes?.length > 0) && 1}
            />
          )}
        </Modal>
      )}
      {isCustomerMode && customerModalOpen && (
        <Modal
          open={customerModalOpen}
          width='80%'
          onClose={() => setCustomerModalOpen(false)}
          padding='20px'
          hideCloseDefault
        >
          <UserEdit>
            {!customerState?.loading && (
              <>
                <UserDetails
                  isAddressFormOpen={isAddressFormOpen}
                  userData={customerState?.user}
                  userId={customerState?.user?.id}
                  isOpenUserData={isOpenUserData}
                  isCustomerMode
                  isModal
                  setIsOpenUserData={setIsOpenUserData}
                  onClose={() => setCustomerModalOpen(false)}
                />
                <AddressList
                  isModal
                  userId={customerState?.user?.id}
                  changeOrderAddressWithDefault
                  userCustomerSetup={customerState.user}
                  isOpenUserData={isOpenUserData}
                  setCustomerModalOpen={setCustomerModalOpen}
                  setIsOpenUserData={setIsOpenUserData}
                  setIsAddressFormOpen={setIsAddressFormOpen}
                  isHeader
                  isCustomerMode={isCustomerMode}
                />
              </>
            )}
          </UserEdit>
        </Modal>
      )}
      {authModalOpen && !auth && (
        <Modal
          open={authModalOpen}
          onRemove={() => { if (!authLoading) closeAuthModal() }}
          onClose={() => { if (!authLoading) closeAuthModal() }}
          width='50%'
          authModal
          closeOnBackdrop={!authLoading}
        >
          {modalPageToShow === 'login' && (
            <LoginForm
              notificationState={notificationState}
              handleSuccessLogin={handleSuccessLogin}
              onAuthLoadingChange={setAuthLoading}
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
              closeModal={() => closeAuthModal()}
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
      <Confirm
        title={t('CUSTOMER', theme?.defaultLanguages?.CUSTOMER || 'Customer')}
        content={confirm.content}
        acceptText={t('ACCEPT', theme?.defaultLanguages?.ACCEPT || 'Accept')}
        open={isCustomerMode && confirm.open}
        onClose={() => setConfirm({ ...confirm, open: false })}
        onCancel={() => setConfirm({ ...confirm, open: false })}
        onAccept={confirm.handleOnAccept}
        closeOnBackdrop={false}
      />
      {!!preorderBusiness && (
        <Modal
          open={!!preorderBusiness}
          width='760px'
          onClose={() => handleClosePreorder()}
        >
          <BusinessPreorder
            business={preorderBusiness}
            handleClick={handleBusinessClick}
            showButton
          />
        </Modal>
      )}
    </HeaderContainer>
  )
}

export default Header

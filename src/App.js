import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Switch,
  Route,
  Redirect,
  Link,
  useLocation,
  useHistory
} from 'react-router-dom'
import parse from 'html-react-parser'
import { useTheme } from 'styled-components'
import loadable from '@loadable/component'
import settings from './config'
import { parseSearchQueryLocation, formatSearchQueryLocation, stripLocationSearchParams } from './utils/searchQueryLocation'

import { useSession } from '~components/contexts/SessionContext'
import { useApi } from '~components/contexts/ApiContext'
import { useLanguage } from '~components/contexts/LanguageContext'
import { useOrder } from '~components/contexts/OrderContext'
import { useConfig } from '~components/contexts/ConfigContext'
import { isWalletEnabled as isWalletConfigEnabled } from '~components/utils/configHelpers'
import { useEvent } from '~components/contexts/EventContext'
import { useOrderingTheme } from '~components/contexts/OrderingThemeContext'
import { useSite } from '~components/contexts/SiteContext'

import { Alert } from '~ui/src/components/Confirm'
import { useWindowSize } from '~ui/hooks/useWindowSize'
import { useOnlineStatus } from '~ui/hooks/useOnlineStatus'
import { useResumeRecovery } from '~ui/hooks/useResumeRecovery'
import { ThemeProvider } from '~ui/contexts/ThemeContext'
import { SmartAppBanner } from '~ui/src/components/SmartAppBanner'
import { WebManifest } from '~ui/src/components/WebManifest'
import { PWAPrompt } from '~ui/src/components/PWAPrompt'
import { SpinnerLoader } from '~ui/src/components/SpinnerLoader'
import { PostLoginHomeGate } from '~ui/src/components/PostLoginHomeGate'
import { Header } from '~ui/src/components/Header'
import { Modal } from '~ui/src/components/Modal'
import { Button } from '~ui/src/styles/Buttons'
import { Input } from '~ui/src/styles/Inputs'
import { Footer } from '~ui/src/components/Footer'
import { NotNetworkConnectivity } from '~ui/src/components/NotNetworkConnectivity'
import { NavigationBar } from '~ui/src/components/NavigationBar'
import { WebsocketStatus } from '~ui/src/components/WebsocketStatus'
import { CookieConsentBanner } from '~ui/src/components/CookieConsentBanner'

import { lazyRetry } from './components/LazyRetry'
import { useCookieConsent } from './contexts/CookieConsentContext'
import { useProfileCompletion } from './contexts/CheckoutFieldsContext'
import { SentryInitializer } from './components/SentryInitializer'
import { ForterScript } from './components/ForterScript'
import ConsentUserSync from './components/ConsentUserSync'
import { IntercomWrapper } from './components/IntercomWrapper'
import { getSiteFaviconUrl, getSiteLogoUrl } from './utils/siteBranding'
import { resolveTrackingOnly } from './utils/trackingOnlyMode'
import { firebasePushSetup, getFirebaseWebConfig, isFirebasePushEnabled, getOpenedPushOrderUuid } from './utils/firebaseWebPush'

// Custom font weights arrive as a number, a JSON array string ("[400,700]"),
// or a plain string ("400;700"). Parse defensively so a non-JSON value can't
// throw and crash the theme font injection.
const parseFontWeights = (weights) => {
  if (typeof weights === 'number') return weights
  if (typeof weights !== 'string') return undefined
  try {
    return JSON.parse(weights)?.join?.(';') ?? weights
  } catch (_) {
    return weights
  }
}

const AddressList = loadable(() => lazyRetry(() => import('./pages/AddressList')))
const SavedCards = loadable(() => lazyRetry(() => import('./pages/SavedCards')))
const BusinessesList = loadable(() => lazyRetry(() => import('./pages/BusinessesList')))
const BusinessProductsList = loadable(() => lazyRetry(() => import('./pages/BusinessProductsList')))
const CheckoutPage = loadable(() => lazyRetry(() => import('./pages/Checkout')))
const Cms = loadable(() => lazyRetry(() => import('./pages/Cms')))
const HomePage = loadable(() => lazyRetry(() => import('./pages/Home')))
const MyOrders = loadable(() => lazyRetry(() => import('./pages/MyOrders')))
const OrderDetailsPage = loadable(() => lazyRetry(() => import('./pages/OrderDetails')))
const PageNotFound = loadable(() => lazyRetry(() => import('./pages/PageNotFound')))
const TrackingOnlyRoutes = loadable(() => lazyRetry(() => import('./components/TrackingOnlyRoutes')))
const PagesList = loadable(() => lazyRetry(() => import('./pages/PagesList')))

const ScrollToTop = loadable(() => lazyRetry(() => import('./components/ScrollToTop')))
const ListenPageChanges = loadable(() => lazyRetry(() => import('./components/ListenPageChanges')))
const HelmetTags = loadable(() => lazyRetry(() => import('./components/HelmetTags')))
const Profile = loadable(() => lazyRetry(() => import('./pages/Profile')))
const Wallets = loadable(() => lazyRetry(() => import('./pages/Wallets')))
const MessagesList = loadable(() => lazyRetry(() => import('./pages/MessagesList')))
const Help = loadable(() => lazyRetry(() => import('./pages/Help')))
const Favorite = loadable(() => lazyRetry(() => import('./pages/Favorite')))
const SessionsList = loadable(() => lazyRetry(() => import('./pages/SessionsList')))
const SignUpBusiness = loadable(() => lazyRetry(() => import('./pages/SignUpBusiness')))
const SignUpDriver = loadable(() => lazyRetry(() => import('./pages/SignUpDriver')))
const UserVerification = loadable(() => lazyRetry(() => import('./pages/UserVerification')))
const CompleteProfile = loadable(() => lazyRetry(() => import('./pages/CompleteProfile')))
const Promotions = loadable(() => lazyRetry(() => import('./pages/Promotions')))
const ResetPassword = loadable(() => lazyRetry(() => import('./pages/ResetPassword')))
const MultiCheckout = loadable(() => lazyRetry(() => import('./pages/MultiCheckout')))
const MultiCart = loadable(() => lazyRetry(() => import('./pages/MultiCart')))
const MultiOrdersDetails = loadable(() => lazyRetry(() => import('./pages/MultiOrdersDetails')))
const BusinessListingSearch = loadable(() => lazyRetry(() => import('./pages/BusinessListingSearch')))

// Trackers render only after boot/consent; keeping them out of the entry chunk
// spares it their vendors (e.g. @segment/analytics-next).
const Analytics = loadable(() => import('~components/components/Analitycs').then((m) => m.Analytics))
const AnalyticsSegment = loadable(() => import('~components/components/AnalyticsSegment').then((m) => m.AnalyticsSegment))
const FacebookPixel = loadable(() => import('~components/components/FacebookPixel').then((m) => m.FacebookPixel))
const GoogleConversion = loadable(() => import('~components/components/GoogleConversion').then((m) => m.GoogleConversion))

// Conditionally-rendered overlays (order reviews, cancellations, signup
// approval, Spoonity login) — not needed for first paint.
const CancellationComponent = loadable(() => import('~ui/src/components/CancellationComponent').then((m) => m.CancellationComponent))
const ReviewTrigger = loadable(() => import('~ui/src/components/ReviewTrigger').then((m) => m.ReviewTrigger))
const ReviewOrder = loadable(() => import('~ui/src/components/ReviewOrder').then((m) => m.ReviewOrder))
const ReviewProduct = loadable(() => import('~ui/src/components/ReviewProduct').then((m) => m.ReviewProduct))
const ReviewDriver = loadable(() => import('~ui/src/components/ReviewDriver').then((m) => m.ReviewDriver))
const SignUpApproval = loadable(() => import('~ui/src/components/SignUpApproval').then((m) => m.SignUpApproval))
const QueryLoginSpoonity = loadable(() => import('~ui/src/components/QueryLoginSpoonity').then((m) => m.QueryLoginSpoonity))

const GATE_EXEMPT_PATHS = ['/checkout', '/multi-checkout', '/orders', '/multi-orders']

export const App = () => {
  const history = useHistory()
  const [{ auth, user, token }, { login }] = useSession()
  const profileCompletion = useProfileCompletion()
  const [events] = useEvent()
  const [ordering] = useApi()
  const theme = useTheme()
  const [orderStatus, { changeType, getLastOrderHasNoReview }] = useOrder()
  const [{ configs, loading: configLoading }] = useConfig()
  const [{ loading: siteLoading, site }] = useSite()
  const [languageState, t] = useLanguage()
  const [orderingTheme] = useOrderingTheme()
  const [loaded, setLoaded] = useState(false)
  const onlineStatus = useOnlineStatus()
  useResumeRecovery()
  const location = useLocation()
  const [alertState, setAlertState] = useState({ open: false, content: [] })
  const windowSize = useWindowSize()
  const [businessSignUpSuccessed, setBusinessSignUpSuccessed] = useState({ open: false, content: {} })
  const [searchValue, setSearchValue] = useState('')
  const [lastOrderReview, setLastOrderReview] = useState({
    isReviewOpen: false,
    order: null,
    defaultStar: 5,
    reviewStatus: { trigger: false, order: false, product: false, driver: false },
    reviewed: { isOrderReviewed: false, isProductReviewed: false, isDriverReviewed: false }
  })
  const [oneSignalState, setOneSignalState] = useState({
    notification_app: settings.notification_app
  })
  const firebasePushSetupRef = useRef(false)
  const customOrderEnabled = configs?.custom_order_enabled?.value === '1'

  const { hasConsented, setIsConsentEnabled } = useCookieConsent()
  const isShowReviewsPopupEnabled = configs?.show_reviews_popups_enabled?.value === '1'
  const hashKey = new URLSearchParams(useLocation()?.search)?.get('hash') || null
  const isKioskApp = settings?.use_kiosk
  const enabledPoweredByOrdering = (typeof window !== 'undefined' ? window.__CONFIG__?.disable_powered_by : undefined) !== undefined
    ? !window.__CONFIG__.disable_powered_by
    : configs?.powered_by_ordering_module?.value

  let queryIntegrationToken
  let queryIntegrationCode
  if (location.search) {
    const query = new URLSearchParams(location.search)
    queryIntegrationCode = query.get('integration_code')
    queryIntegrationToken = query.get('integration_token')
  }

  const themeUpdated = useMemo(() => ({
    ...theme,
    ...orderingTheme?.theme,
    colors: {
      ...theme.colors,
      ...(orderingTheme?.theme?.my_products?.components?.theme_settings?.components?.style?.primary_btn_color && { primary: orderingTheme?.theme?.my_products?.components?.theme_settings?.components?.style?.primary_btn_color }),
      ...(orderingTheme?.theme?.my_products?.components?.theme_settings?.components?.style?.primary_link_color && { links: orderingTheme?.theme?.my_products?.components?.theme_settings?.components?.style?.primary_link_color }),
      ...(orderingTheme?.theme?.my_products?.components?.theme_settings?.components?.style?.background_page && { backgroundPage: orderingTheme?.theme?.my_products?.components?.theme_settings?.components?.style?.background_page })
    },
    images: {
      ...theme.images,
      general: {
        ...theme.images.general,
        homeHero: orderingTheme?.theme?.homepage_view?.components?.homepage_header?.components?.image || theme.images?.general?.homeHero,
        businessHero: orderingTheme?.theme?.business_listing_view?.components?.business_hero?.components?.image || theme.images?.general?.businessHero,
        notFound: orderingTheme?.theme?.business_listing_view?.components?.not_found_source?.components?.image || theme.images?.general?.notFound,
        emptyActiveOrders: orderingTheme?.theme?.orders?.components?.active_orders?.components?.not_found_source?.components?.image || theme.images?.general?.emptyActiveOrders,
        emptyPastOrders: orderingTheme?.theme?.orders?.components?.past_orders?.components?.not_found_source?.components?.image,
        notNetwork: orderingTheme?.theme?.no_internet?.components?.image || theme.images?.general?.notNetwork,
        businessSignUpHero: orderingTheme?.theme?.business_signup?.components?.icon?.components?.image || theme.images?.general?.businessSignUpHero,
        driverSignUpHero: orderingTheme?.theme?.driver_signup?.components?.icon?.components?.image || theme.images?.general?.driverSignUpHero
      },
      categories: {
        ...theme.images.categories,
        food: orderingTheme?.theme?.business_listing_view?.components?.categories?.components?.food?.image || theme.images.categories.food,
        groceries: orderingTheme?.theme?.business_listing_view?.components?.categories?.components?.groceries?.image || theme.images.categories.groceries,
        alcohol: orderingTheme?.theme?.business_listing_view?.components?.categories?.components?.alcohol?.image || theme.images.categories.alcohol,
        laundry: orderingTheme?.theme?.business_listing_view?.components?.categories?.components?.laundry?.image || theme.images.categories.laundry,
        all: orderingTheme?.theme?.business_listing_view?.components?.categories?.components?.all?.image || theme.images.categories.all
      },
      dummies: {
        ...theme.images.dummies,
        businessHeader: orderingTheme?.theme?.business_view?.components?.header?.components?.dummy_image || theme.images.dummies.businessHeader,
        businessLogo: orderingTheme?.theme?.business_view?.components?.header?.components?.logo?.dummy_image || theme.images.dummies.businessLogo,
        product: orderingTheme?.theme?.business_view?.components?.products?.components?.photo?.components?.dummy_image || theme.images.dummies.product
      },
      logos: {
        ...theme.images.logos,
        logotype: getSiteLogoUrl(
          orderingTheme?.theme?.my_products?.components?.images?.components?.logo?.components?.image,
          theme.images.logos.logotype
        )
      }
    },
    utils: {
      tsize: {
        xxl: 48,
        xl: 32,
        l: 24,
        m: 20,
        s: 16,
        xs: 14,
        xxs: 12
      },
      radius: {
        s: 15,
        m: 30
      },
      margins: {
        t: 20,
        b: 10,
        r: 10,
        l: 10
      },
      zi: {
        l: 99999,
        m: 9999
      }
    }
  }), [theme, orderingTheme])

  const isTrackingOnly = resolveTrackingOnly(themeUpdated)

  const websiteThemeType = themeUpdated?.my_products?.components?.website_theme?.components?.type
  const websiteThemeBusinessSlug = themeUpdated?.my_products?.components?.website_theme?.components?.business_slug
  const updatedBusinessSlug = (websiteThemeType === 'single_store' && websiteThemeBusinessSlug) || settings?.businessSlug
  const franchiseLayout = themeUpdated?.my_products?.components?.website_theme?.components?.franchise_slug
  const isFranchiseOne = franchiseLayout === 'franchise_1'
  const businessesSlug = {
    marketplace: 'marketplace',
    kiosk: updatedBusinessSlug,
    business: updatedBusinessSlug
  }

  const singleBusinessConfig = {
    isActive: settings?.use_marketplace || updatedBusinessSlug || isKioskApp,
    businessSlug: businessesSlug[isKioskApp ? 'kiosk' : settings?.use_marketplace ? 'marketplace' : 'business']
  }

  const signUpBusinesslayout = themeUpdated?.business_signup?.components?.layout?.type === 'old'
    ? 'old'
    : 'new'

  const signUpDriverlayout = themeUpdated?.driver_signup?.components?.layout?.type === 'old'
    ? 'old'
    : 'new'

  const locationSearchParams = new URLSearchParams(location.search)
  const orderTypeSearchParam = parseInt(locationSearchParams.get('order_type') ?? 0, 10)
  const hasLocationSearchParams = ['lat', 'lng', 'order_type'].some(param => locationSearchParams.has(param))
  const searchQueryLocation = parseSearchQueryLocation(location.search)
  const hasSearchQueryLocation = !!searchQueryLocation
  const hasOrderSearchLocation = !!formatSearchQueryLocation(orderStatus.options?.address?.location)
  const hasOrderAddressContext = !!orderStatus.options?.address_id || hasOrderSearchLocation
  const hasBusinessSearchLocation = hasOrderSearchLocation || hasSearchQueryLocation
  // glutenfre: el Home (buscador + categorías) se muestra siempre en '/',
  // incluso con una dirección ya guardada. El comportamiento default de
  // Ordering salta directo a /search para usuarios recurrentes con
  // dirección; acá el cliente pidió explícitamente que el Home no se salte.
  const shouldRedirectHomeToOrderLocation = false
  const homeOrderLocationRedirectPath = singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/search'
  const logoHomeTarget = shouldRedirectHomeToOrderLocation
    ? singleBusinessConfig.isActive
      ? { page: 'business', params: { business_slug: singleBusinessConfig.businessSlug } }
      : { page: 'search' }
    : null
  const configTypes = configs?.order_types_allowed?.value?.split('|').map(value => Number(value)) || []

  const isWalletEnabled = configs?.cash_wallet?.value && isWalletConfigEnabled(configs) && !isKioskApp
  const isEmailVerifyRequired = auth && configs?.verification_email_required?.value === '1' && !user?.email_verified
  const isPhoneVerifyRequired = auth && configs?.verification_phone_required?.value === '1' && !user?.phone_verified
  const isUserVerifyRequired = (isEmailVerifyRequired || isPhoneVerifyRequired) && !isKioskApp
  const isHideFooter = themeUpdated?.footer?.hidden

  // The gate stays off during checkout and order confirmation: converting a guest into a user
  // mid-order would otherwise swap the page away while the order is being placed.
  const isGateExemptPath = GATE_EXEMPT_PATHS.some(path => location.pathname.startsWith(path))
  const isProfileCompletionRequired = profileCompletion.isRequired && !isGateExemptPath && !isKioskApp && !isTrackingOnly

  const guestCheckoutEnabled = false
  // configs?.guest_checkout_enabled?.value === '1' &&
  // (!orderTypeList[orderStatus?.options?.type - 1] || configs?.allowed_order_types_guest_checkout?.value?.includes(orderTypeList[orderStatus?.options?.type - 1]))

  const isHome = location.pathname === '/' || location.pathname === '/home'
  const isFooterPage = location.pathname === '/pages/footer' || isKioskApp || isHideFooter || isTrackingOnly

  const closeAlert = () => {
    setAlertState({
      open: false,
      content: []
    })
  }

  const acceptAlert = () => {
    window.localStorage.setItem('front_version', configs?.front_version?.value)
    window.location.reload()
  }

  const handleSuccessSignup = (user) => {
    if (!user?.enabled && (configs?.business_signup_enabled_default?.value === '0' || configs?.driver_signup_enabled_default?.value === '0')) {
      signUpBusinesslayout === 'new'
        ? setBusinessSignUpSuccessed({
          open: true,
          content: {
            approvalType: 'no_automatic',
            businessType: user?.level,
            project: ordering?.project,
            dashboardUrl: settings.url_dashboard,
            dashboardLoginUrl: `${settings.url_dashboard}/login/?project=${ordering?.project}&token=${user?.session?.access_token}`,
            contactEmail: settings.contact_email
          }
        })
        : setAlertState({
          open: true,
          content: [t('BUSINESS_SIGNUP_MESSAGE', 'We will contact you as soon as possible')]
        })
      return
    }

    if (configs?.business_signup_enabled_default?.value === '1' || configs?.driver_signup_enabled_default?.value === '1') {
      signUpBusinesslayout === 'new'
        ? setBusinessSignUpSuccessed({
          open: true,
          content: {
            approvalType: 'automatic',
            businessType: user?.level,
            project: ordering?.project,
            dashboardUrl: settings.url_dashboard,
            dashboardLoginUrl: `${settings.url_dashboard}/login/?project=${ordering?.project}&token=${user?.session?.access_token}`,
            contactEmail: settings.contact_email
          }
        })
        : setAlertState({
          open: true,
          content: [
            `${t('PROJECT', 'Project')}: ${ordering?.project}`
          ],
          links: [
            <span key='url dashboard'>
              {`${t('DASHBOARD_WEBPAGE_MESSAGE', 'Dashboard webpage')}: `}
              <a
                target='blank'
                href={`${settings.url_dashboard}/login/?project=${ordering?.project}&token=${user?.session?.access_token}`}
              >
                <span style={{ color: theme.colors.links }}>{settings.url_dashboard}</span>
              </a>
            </span>
          ],
          isOnlyAlert: true
        })

      login({
        user,
        token: user?.session?.access_token
      })
    }
  }

  const goToPage = (page, params) => {
    events.emit('go_to_page', { page, params })
  }

  const _getLastOrderHasNoReview = async () => {
    const lastOrderHasNoReview = await getLastOrderHasNoReview()
    lastOrderHasNoReview && OrderReviewRequired(lastOrderHasNoReview)
  }

  const reviewModalTitle = () => {
    if (lastOrderReview?.reviewStatus?.trigger) return t('DONT_FORGET_TO_RATE_YOUR_ORDER', 'Don\'t forget to rate your order!')
    if (lastOrderReview?.reviewStatus?.order) return t('REVIEW_ORDER', 'Review order')
    if (lastOrderReview?.reviewStatus?.product) return t('REVIEW_PRODUCT', 'Review Product')
    return t('REVIEW_DRIVER', 'Review Driver')
  }

  const OrderReviewRequired = (order) => {
    setLastOrderReview({
      isReviewOpen: !!((location?.pathname === '/' || location?.pathname === '/search' || location?.pathname === '/home')),
      order,
      defaultStar: 5,
      reviewStatus: { trigger: true, order: false, product: false, driver: false },
      reviewed: { isOrderReviewed: false, isProductReviewed: false, isDriverReviewed: false }
    })
  }

  const handleOpenOrderReview = (star) => {
    setLastOrderReview({
      ...lastOrderReview,
      defaultStar: star,
      reviewStatus: { trigger: false, order: true, product: false, driver: false }
    })
  }

  const handleCloseReivew = () => {
    setLastOrderReview({
      ...lastOrderReview,
      isReviewOpen: false,
      reviewStatus: { trigger: false, order: false, product: false, driver: false }
    })
  }

  const setIsReviewed = (reviewType) => {
    const _reviewStatus = { ...lastOrderReview?.reviewed }
    setLastOrderReview({
      ...lastOrderReview,
      reviewed: { ..._reviewStatus, [reviewType]: true }
    })
  }

  const closeReviewOrder = () => {
    const enableProduct = lastOrderReview?.order?.products.some(product => !product?.deleted)
    if (!lastOrderReview?.reviewed?.isProductReviewed && enableProduct) setLastOrderReview({ ...lastOrderReview, reviewStatus: { order: false, product: true, driver: false } })
    else if ((lastOrderReview?.order?.driver || enableProduct) && !lastOrderReview?.order?.user_review && !lastOrderReview?.reviewed?.isDriverReviewed) setLastOrderReview({ ...lastOrderReview, reviewStatus: { order: false, product: false, driver: true } })
    else handleCloseReivew()
  }

  const closeReviewProduct = () => {
    if (lastOrderReview?.order?.driver && !lastOrderReview?.order?.user_review && !lastOrderReview?.reviewed?.isDriverReviewed) setLastOrderReview({ ...lastOrderReview, reviewStatus: { order: false, product: false, driver: true } })
    else {
      setIsReviewed('isDriverReviewed')
      handleCloseReivew()
    }
  }

  useEffect(() => {
    const hasThemeFavicon = themeUpdated?.general?.components?.favicon?.components.image
    const faviconHref = getSiteFaviconUrl(hasThemeFavicon, site?.logo)
    let favicon = document.getElementById('favicon')
    if (!favicon) {
      if (orderingTheme?.loading) return
      favicon = document.createElement('link')
      favicon.id = 'favicon'
      favicon.rel = 'icon'
      favicon.type = 'image/png'
      document.head.appendChild(favicon)
    }

    if (favicon.getAttribute('href') !== faviconHref) {
      favicon.setAttribute('href', faviconHref)
    }

    const fonts = Object.entries(themeUpdated?.general?.components?.fonts || {})
    fonts.forEach(([name, fontFamily]) => {
      const fontElement = window.document.getElementById(`${name}-font-styles`)
      if (
        (fontElement?.name !== fontFamily.name && fontFamily.name) ||
        (fontElement?.href !== fontFamily?.href && fontFamily?.href) ||
        (JSON.stringify(fontElement?.weights) !== JSON.stringify(fontFamily?.weights) && fontFamily?.weights)
      ) {
        fontElement?.remove()
        const font = window.document.createElement('link')
        font.id = `${name}-font-styles`
        font.rel = 'stylesheet'
        font.async = true
        font.defer = true
        font.name = fontFamily.name
        const weights = parseFontWeights(fontFamily?.weights)
        font.href = fontFamily.href || `https://fonts.googleapis.com/css2?family=${fontFamily?.name}:wght@${weights || [400]}&display=swap`

        window.document.body.appendChild(font)
        if (name === 'primary') {
          window.document.body.style.fontFamily = fontFamily.name
        }
      }
    })
  }, [themeUpdated, site?.logo])

  useEffect(() => {
    if (!hasConsented || !themeUpdated?.third_party_code?.body) return

    if (document.getElementById('third-party-body-scripts-loaded')) return

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = themeUpdated.third_party_code.body

    const scripts = tempDiv.querySelectorAll('script')
    scripts.forEach(script => {
      const newScript = document.createElement('script')
      if (script.src) {
        newScript.src = script.src
      } else {
        newScript.innerHTML = script.innerHTML
      }
      if (script.type) {
        newScript.type = script.type
      }
      document.body.appendChild(newScript)
    })

    const marker = document.createElement('div')
    marker.id = 'third-party-body-scripts-loaded'
    marker.style.display = 'none'
    document.body.appendChild(marker)
  }, [hasConsented, themeUpdated?.third_party_code?.body])

  useEffect(() => {
    if (!isShowReviewsPopupEnabled) return
    const _user = window.localStorage.getItem('user')
    const _token = window.localStorage.getItem('token')
    const _reviewRequired = window.sessionStorage.getItem('review-required')
    if (((_user || _token) && auth) && _reviewRequired !== '1' && window.location.pathname === '/search') {
      window.sessionStorage.setItem('review-required', '1')
      _getLastOrderHasNoReview()
    }
    if (!(_user || _token)) {
      window.sessionStorage.removeItem('review-required')
    }
  }, [auth, isShowReviewsPopupEnabled, window.location.pathname])

  useEffect(() => {
    if (auth) {
      window.localStorage.removeItem('change_store_redirect')
    }
  }, [auth])

  useEffect(() => {
    if (!loaded && !orderStatus.loading && !configLoading && !siteLoading && !orderingTheme?.loading) {
      const shouldApplyOrderTypeFromUrl = orderTypeSearchParam &&
        configTypes.includes(orderTypeSearchParam) &&
        !hasOrderAddressContext &&
        !(auth && hasLocationSearchParams)
      if (shouldApplyOrderTypeFromUrl) {
        changeType(parseInt(orderTypeSearchParam, 10))
        if (orderStatus?.options?.type === parseInt(orderTypeSearchParam, 10)) {
          setLoaded(true)
        }
        return
      }
      setLoaded(true)
    }
  }, [orderStatus, configLoading, siteLoading, orderingTheme, hasOrderAddressContext, orderTypeSearchParam, auth, hasLocationSearchParams])

  useEffect(() => {
    const shouldCleanLocationParams = ['/search', '/business_search'].includes(location.pathname)
    if (!shouldCleanLocationParams || orderStatus.loading) return
    if (!hasOrderAddressContext) return

    const params = new URLSearchParams(location.search)
    const hadLocationParams = ['lat', 'lng', 'order_type'].some(param => params.has(param))
    if (!hadLocationParams) return

    history.replace(`${location.pathname}${stripLocationSearchParams(location.search)}`)
  }, [location.pathname, location.search, orderStatus.loading, hasOrderAddressContext, history])

  useEffect(() => {
    if (configs?.front_version?.value && loaded) {
      const localStorageFrontVersion = window.localStorage.getItem('front_version')
      if (localStorageFrontVersion && localStorageFrontVersion !== configs?.front_version?.value) {
        setAlertState({
          open: true,
          content: [t('RELOAD_FRONT_QUESTION', 'There is a new version of Ordering! Do you want to update it?')]
        })
      }
    }
  }, [configs, loaded])

  useEffect(() => {
    if (isHome && (settings?.use_marketplace || updatedBusinessSlug)) {
      goToPage('business', { store: settings?.use_marketplace ? 'marketplace' : updatedBusinessSlug })
    }
  }, [])

  useEffect(() => {
    if (!orderStatus.loading) {
      const localCountryCode = orderStatus?.options?.address?.country_code ??
        window.localStorage.getItem('country-code')

      if (localCountryCode) {
        ordering?.setCountryCode && ordering.setCountryCode(localCountryCode)
      }
    }
  }, [orderStatus])

  useEffect(() => {
    if (
      languageState?.error &&
      languageState?.error?.includes('This project does not exist') &&
      settings?.use_project_subdomain
    ) {
      window.open('https://www.orderingplus.com', '_self')
    }
  }, [languageState])

  const oneSignalSetup = () => {
    const OneSignal = window.OneSignal || []
    const hostname = window.location.hostname
    const initConfig = {
      appId: configs?.onesignal_orderingweb_id?.value,
      allowLocalhostAsSecureOrigin: hostname === 'localhost',
      notificationClickHandlerAction: 'navigate'
    }

    OneSignal.push(function () {
      OneSignal.SERVICE_WORKER_PARAM = { scope: '/push/onesignal/' }
      OneSignal.SERVICE_WORKER_PATH = 'push/onesignal/OneSignalSDKWorker.js'
      OneSignal.SERVICE_WORKER_UPDATER_PATH = 'push/onesignal/OneSignalSDKWorker.js'
      if (!OneSignal._initCalled) {
        OneSignal.init(initConfig)
      }

      const onNotificationClicked = function (data) {
        if (data?.data?.order_uuid) {
          history.push(`/orders/${data?.data?.order_uuid}`)
        }
      }
      const handler = function (data) {
        onNotificationClicked(data)
        if (typeof OneSignal.addListenerForNotificationOpened === 'function') {
          OneSignal.addListenerForNotificationOpened(handler)
        }
      }
      if (typeof OneSignal.addListenerForNotificationOpened === 'function') {
        OneSignal.addListenerForNotificationOpened(handler)
      }

      OneSignal.on('subscriptionChange', function (isSubscribed) {
        if (isSubscribed) {
          OneSignal.getUserId((userId) => {
            const data = {
              ...oneSignalState,
              notification_token: userId
            }
            setOneSignalState(data)
          })
        }
      })

      OneSignal.getUserId((userId) => {
        const data = {
          ...oneSignalState,
          notification_token: userId
        }
        setOneSignalState(data)
      })
    })
  }

  useEffect(() => {
    if (configLoading) return
    const enabled = configs?.cookie_consent_enabled?.value === '1' ||
      (!configs?.cookie_consent_enabled && settings?.cookie_consent_enabled)
    setIsConsentEnabled(!!enabled)
  }, [configLoading, configs?.cookie_consent_enabled])

  const firebaseWebPushSetup = () => {
    if (firebasePushSetupRef.current) return
    firebasePushSetupRef.current = true
    firebasePushSetup({
      config: getFirebaseWebConfig(configs),
      onToken: (fcmToken) => {
        setOneSignalState({
          ...oneSignalState,
          notification_token: fcmToken,
          notification_provider: 'fcm'
        })
      },
      onNotificationClick: (data) => {
        const orderUuid = getOpenedPushOrderUuid(data)
        if (orderUuid) {
          history.push(`/orders/${orderUuid}`)
        }
      }
    }).catch((error) => {
      firebasePushSetupRef.current = false
      console.log('Firebase push setup error:', error)
    })
  }

  const subscribePushNotifications = async () => {
    try {
      await fetch(`${ordering.root}/users/${user?.id}/notification_tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          token: oneSignalState.notification_token,
          user_id: user?.id,
          app: oneSignalState.notification_app,
          provider: oneSignalState.notification_provider
        })
      })
    } catch (error) {
      console.log('Firebase push subscribe error:', error)
    }
  }

  useEffect(() => {
    if (!auth || !oneSignalState?.notification_token || !oneSignalState?.notification_provider) return
    subscribePushNotifications()
  }, [auth, oneSignalState?.notification_token])

  useEffect(() => {
    if (settings._local_project_pin || configLoading || !hasConsented) return
    if (isFirebasePushEnabled(configs)) {
      firebaseWebPushSetup()
      return
    }
    oneSignalSetup()
  }, [configLoading, events, hasConsented])

  return settings.isCancellation
    ? (
      <CancellationComponent
        ButtonComponent={Button}
        InputComponent={Input}
      />
      )
    : (
      <>
        <div style={{ marginBottom: windowSize.width < 576 && onlineStatus && !isTrackingOnly ? 80 : 0 }}>
          <ConsentUserSync />
          <SentryInitializer />
          <ForterScript />
          {hasConsented && (!!configs?.track_id_google_analytics?.value || !!settings?.store_google_analytics_id) && (
            <Analytics trackId={singleBusinessConfig?.isActive ? settings?.store_google_analytics_id : configs?.track_id_google_analytics?.value} />
          )}
          {hasConsented && (!!configs?.segment_track_id?.value || !!settings?.store_segment_id) && (
            <AnalyticsSegment writeKey={singleBusinessConfig?.isActive ? settings?.store_segment_id : configs?.segment_track_id?.value} />
          )}
          {hasConsented && (!!configs?.facebook_id?.value || !!settings?.store_facebook_pixel_id) && FacebookPixel && (
            <FacebookPixel trackId={singleBusinessConfig?.isActive ? settings?.store_facebook_pixel_id : configs?.facebook_id?.value} />
          )}
          {hasConsented && settings?.project && (
            <GoogleConversion projectCode={settings.project} />
          )}
          {/* Boot gate resolves in <~500ms now that config/theme/site/i18n are
              edge-injected — the pre-loading animation only appears as a
              fallback when a load genuinely exceeds the delay. */}
          {!loaded && <SpinnerLoader delayMs={600} data-doc-section='global-boot-loading' />}
          <WebManifest
            ready={!languageState.loading && !siteLoading}
            theme={themeUpdated}
            site={site}
            settings={settings}
            languageCode={languageState.language?.code}
          />
          {!isTrackingOnly && (
            <SmartAppBanner
              appName={site?.name || settings?.app_name}
              description={site?.description}
              storeAndroidId={themeUpdated?.smart_banner_settings?.android_id ?? settings?.store_android_id}
              storeAppleId={themeUpdated?.smart_banner_settings?.apple_id ?? settings?.store_apple_id}
              logo={getSiteLogoUrl(
                themeUpdated?.my_products?.components?.images?.components?.logo_mobile?.components?.image ||
                themeUpdated?.my_products?.components?.images?.components?.logo?.components?.image,
                themeUpdated?.images?.logos?.logotype
              )}
            />
          )}
          {
            loaded && (
              <ThemeProvider
                theme={themeUpdated}
              >
                <ListenPageChanges />
                {!(isKioskApp && isHome) && (
                  <Header
                    isHome={isHome}
                    location={location}
                    isCustomLayout={singleBusinessConfig.isActive}
                    singleBusinessConfig={singleBusinessConfig}
                    logoHomeTarget={logoHomeTarget}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    notificationState={oneSignalState}
                    businessSlug={updatedBusinessSlug}
                    isTrackingOnly={isTrackingOnly}
                    useModalMode
                  />
                )}
                <NotNetworkConnectivity />
                {onlineStatus && isProfileCompletionRequired && (
                  <ScrollToTop>
                    <IntercomWrapper>
                      <CompleteProfile />
                    </IntercomWrapper>
                  </ScrollToTop>
                )}
                {onlineStatus && !isProfileCompletionRequired && (
                  <ScrollToTop>
                    <HelmetTags />
                    <IntercomWrapper>
                      {isTrackingOnly && <TrackingOnlyRoutes />}
                      {!isTrackingOnly && (
                      <Switch>
                        <Route exact path='/home'>
                          {isUserVerifyRequired && !guestCheckoutEnabled
                            ? (
                              <Redirect to='/verify' />
                              )
                            : (
                                isKioskApp || isFranchiseOne
                                  ? <HomePage notificationState={oneSignalState} />
                                  : customOrderEnabled
                                    ? <HomePage notificationState={oneSignalState} />
                                    : shouldRedirectHomeToOrderLocation
                                      ? <Redirect to={homeOrderLocationRedirectPath} />
                                      : singleBusinessConfig.isActive
                                        ? <Redirect to={`/${singleBusinessConfig.businessSlug}`} />
                                        : (
                                        <PostLoginHomeGate auth={auth} hasAddress={!!orderStatus.options?.address?.location} loading={orderStatus.loading}>
                                          <HomePage notificationState={oneSignalState} />
                                        </PostLoginHomeGate>
                                          )
                              )}
                        </Route>
                        <Route exact path='/'>
                          {isUserVerifyRequired && !guestCheckoutEnabled
                            ? (
                              <Redirect to='/verify' />
                              )
                            : (
                                isKioskApp || isFranchiseOne
                                  ? <HomePage notificationState={oneSignalState} />
                                  : queryIntegrationToken && queryIntegrationCode === 'spoonity'
                                    ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                                    : shouldRedirectHomeToOrderLocation
                                      ? <Redirect to={homeOrderLocationRedirectPath} />
                                      : singleBusinessConfig.isActive
                                        ? <Redirect to={`/${singleBusinessConfig.businessSlug}`} />
                                        : (
                                        <PostLoginHomeGate auth={auth} hasAddress={!!orderStatus.options?.address?.location} loading={orderStatus.loading}>
                                          <HomePage notificationState={oneSignalState} />
                                        </PostLoginHomeGate>
                                          )
                              )}
                        </Route>
                        <Route exact path='/wallets'>
                          {auth
                            ? isUserVerifyRequired && !guestCheckoutEnabled
                              ? <Redirect to='/verify' />
                              : isWalletEnabled
                                ? <Wallets />
                                : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                            : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />}
                        </Route>
                        <Route exact path='/signup_business'>
                          {!auth && !isKioskApp && !updatedBusinessSlug
                            ? (
                              <SignUpBusiness
                                elementLinkToLogin={<Link to='/'>{t('LOGIN', 'Login')}</Link>}
                                useLoginByCellphone
                                useChekoutFileds
                                handleSuccessSignup={handleSuccessSignup}
                                layout={signUpBusinesslayout}
                                isRecaptchaEnable
                              />
                              )
                            : (
                              <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                              )}
                        </Route>
                        <Route exact path='/signup-driver'>
                          {!auth && !isKioskApp
                            ? (
                              <SignUpDriver
                                layout={signUpDriverlayout}
                                elementLinkToLogin={<Link to='/'>{t('LOGIN', 'Login')}</Link>}
                                useLoginByCellphone
                                useChekoutFileds
                                handleSuccessSignup={handleSuccessSignup}
                                isRecaptchaEnable
                              />
                              )
                            : (
                              <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                              )}
                        </Route>
                        <Route exact path='/password/reset'>
                          {auth
                            ? (
                              <Redirect to='/' />
                              )
                            : (
                                isKioskApp
                                  ? <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                                  : <ResetPassword />
                              )}
                        </Route>
                        <Route exact path='/profile'>
                          {auth
                            ? isUserVerifyRequired && !guestCheckoutEnabled
                              ? <Redirect to='/verify' />
                              : (<Profile userId={user?.id} accessToken={user?.session?.access_token} useValidationFields />)
                            : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />}
                        </Route>
                        <Route exact path='/verify'>
                          {isUserVerifyRequired && !guestCheckoutEnabled
                            ? <UserVerification />
                            : <Redirect to={(auth || isKioskApp) ? singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/search' : '/'} />}
                        </Route>
                        <Route exact path='/profile/orders'>
                          {auth
                            ? isUserVerifyRequired && !guestCheckoutEnabled
                              ? <Redirect to='/verify' />
                              : (<MyOrders />)
                            : queryIntegrationToken && queryIntegrationCode === 'spoonity'
                              ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                              : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />}
                        </Route>
                        <Route exact path='/profile/addresses'>
                          {auth
                            ? isUserVerifyRequired && !guestCheckoutEnabled
                              ? <Redirect to='/verify' />
                              : (<AddressList />)
                            : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />}
                        </Route>
                        <Route exact path='/profile/cards'>
                          {auth
                            ? isUserVerifyRequired && !guestCheckoutEnabled
                              ? <Redirect to='/verify' />
                              : (<SavedCards />)
                            : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />}
                        </Route>
                        <Route exact path='/messages'>
                          {auth
                            ? isUserVerifyRequired && !guestCheckoutEnabled
                              ? <Redirect to='/verify' />
                              : <MessagesList />
                            : (
                                isKioskApp
                                  ? <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                                  : <Redirect to={{ pathname: '/search' }} />
                              )}
                        </Route>
                        <Route exact path='/help'>
                          {auth
                            ? isUserVerifyRequired && !guestCheckoutEnabled
                              ? <Redirect to='/verify' />
                              : (<Help />)
                            : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />}
                        </Route>
                        <Route exact path='/search'>
                          {
                            isKioskApp || businessesSlug?.business
                              ? <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                              : queryIntegrationToken && queryIntegrationCode === 'spoonity'
                                ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                                : (
                                    orderStatus.loading && !orderStatus.options?.address?.location && !hasSearchQueryLocation
                                      ? (
                                      <SpinnerLoader />
                                        )
                                      : (
                                          isUserVerifyRequired && !guestCheckoutEnabled
                                            ? (
                                          <Redirect to='/verify' />
                                              )
                                            : (
                                                (orderStatus.options?.address?.location || isFranchiseOne || hasSearchQueryLocation) && !singleBusinessConfig.isActive
                                                  ? <BusinessesList searchValueCustom={searchValue} />
                                                  : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                                              )
                                        )
                                  )
                          }
                        </Route>
                        <Route exact path='/business_search'>
                          {
                            isKioskApp || singleBusinessConfig.isActive
                              ? <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                              : (
                                  orderStatus.loading && !hasBusinessSearchLocation
                                    ? (
                                    <SpinnerLoader />
                                      )
                                    : (
                                        isUserVerifyRequired && !guestCheckoutEnabled
                                          ? (
                                        <Redirect to='/verify' />
                                            )
                                          : (
                                              hasBusinessSearchLocation && !singleBusinessConfig.isActive
                                                ? (
                                            <BusinessListingSearch />
                                                  )
                                                : (
                                            <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                                                  )
                                            )
                                      )
                                )
                          }
                        </Route>
                        <Route exact path='/promotions'>
                          {orderStatus.loading && !orderStatus.options?.address?.location
                            ? (
                              <SpinnerLoader />
                              )
                            : (
                                isUserVerifyRequired && !guestCheckoutEnabled
                                  ? (
                                  <Redirect to='/verify' />
                                    )
                                  : (
                                      orderStatus.options?.address?.location && !isKioskApp
                                        ? <Promotions businessSlug={updatedBusinessSlug || null} />
                                        : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                                    )
                              )}
                        </Route>
                        <Route path='/checkout/:cartUuid?'>
                          {auth
                            ? isUserVerifyRequired && !guestCheckoutEnabled
                              ? <Redirect to='/verify' />
                              : <CheckoutPage />
                            : (
                              <Redirect to={{
                                pathname: singleBusinessConfig.isActive
                                  ? `/${singleBusinessConfig.businessSlug}`
                                  : '/',
                                state: { from: location.pathname || null }
                              }}
                              />
                              )}
                        </Route>
                        <Route exact path='/multi-checkout/:cartUuid?'>
                          {auth
                            ? isUserVerifyRequired && !guestCheckoutEnabled
                              ? <Redirect to='/verify' />
                              : <MultiCheckout />
                            : (
                              <Redirect to={{
                                pathname: singleBusinessConfig.isActive
                                  ? `/${singleBusinessConfig.businessSlug}`
                                  : '/',
                                state: { from: location.pathname || null }
                              }}
                              />
                              )}
                        </Route>
                        <Route exact path='/multi-cart'>
                          {auth
                            ? isUserVerifyRequired && !guestCheckoutEnabled
                              ? <Redirect to='/verify' />
                              : <MultiCart />
                            : (
                              <Redirect to={{
                                pathname: singleBusinessConfig.isActive
                                  ? `/${singleBusinessConfig.businessSlug}`
                                  : '/',
                                state: { from: location.pathname || null }
                              }}
                              />
                              )}
                        </Route>
                        <Route exact path='/multi-orders/:orderId'>
                          {auth
                            ? isUserVerifyRequired && !guestCheckoutEnabled
                              ? <Redirect to='/verify' />
                              : <MultiOrdersDetails />
                            : (
                              <Redirect to={{
                                pathname: singleBusinessConfig.isActive
                                  ? `/${singleBusinessConfig.businessSlug}`
                                  : '/',
                                state: { from: location.pathname || null }
                              }}
                              />
                              )}
                        </Route>
                        <Route exact path='/orders/:orderId'>
                          {(auth || hashKey)
                            ? isUserVerifyRequired && !guestCheckoutEnabled
                              ? <Redirect to='/verify' />
                              : <OrderDetailsPage />
                            : (
                              <Redirect to={{
                                pathname: singleBusinessConfig.isActive
                                  ? `/${singleBusinessConfig.businessSlug}`
                                  : '/',
                                state: { from: location.pathname || null }
                              }}
                              />
                              )}
                        </Route>
                        <Route exact path='/promotions'>
                          {(auth || hashKey)
                            ? isUserVerifyRequired && !guestCheckoutEnabled
                              ? <Redirect to='/verify' />
                              : <Promotions businessSlug={updatedBusinessSlug || null} />
                            : (
                              <Redirect to={{
                                pathname: singleBusinessConfig.isActive
                                  ? `/${singleBusinessConfig.businessSlug}`
                                  : '/',
                                state: { from: location.pathname || null }
                              }}
                              />
                              )}
                        </Route>
                        <Route exact path='/pages/:pageSlug'>
                          {isUserVerifyRequired && !guestCheckoutEnabled
                            ? (
                              <Redirect to='/verify' />
                              )
                            : (
                              <Cms />
                              )}
                        </Route>
                        <Route exact path='/pages'>
                          {isUserVerifyRequired && !guestCheckoutEnabled
                            ? (
                              <Redirect to='/verify' />
                              )
                            : (
                              <PagesList />
                              )}
                        </Route>
                        <Route exact path='/favorite'>
                          {auth && !isKioskApp
                            ? <Favorite />
                            : (
                              <Redirect to='/' />
                              )}
                        </Route>
                        <Route exact path='/sessions'>
                          {auth && !isKioskApp
                            ? <SessionsList />
                            : (
                              <Redirect to='/' />
                              )}
                        </Route>
                        <Route exact path='/store'>
                          {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                            ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                            : isUserVerifyRequired && !guestCheckoutEnabled
                              ? (
                                <Redirect to='/verify' />
                                )
                              : (
                                <BusinessProductsList />
                                )}
                        </Route>
                        <Route exact path='/store/:business_slug'>
                          {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                            ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                            : isUserVerifyRequired && !guestCheckoutEnabled
                              ? (
                                <Redirect to='/verify' />
                                )
                              : (
                                <BusinessProductsList />
                                )}
                        </Route>
                        <Route exact path='/store/:business_slug/:category_slug/:product_slug'>
                          {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                            ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                            : isUserVerifyRequired && !guestCheckoutEnabled
                              ? (
                                <Redirect to='/verify' />
                                )
                              : (
                                <BusinessProductsList />
                                )}
                        </Route>
                        <Route exact path='/store/:category_slug/:product_slug'>
                          {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                            ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                            : isUserVerifyRequired && !guestCheckoutEnabled
                              ? (
                                <Redirect to='/verify' />
                                )
                              : (
                                <BusinessProductsList />
                                )}
                        </Route>
                        <Route exact path='/:business_slug'>
                          {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                            ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                            : isUserVerifyRequired && !guestCheckoutEnabled
                              ? (
                                <Redirect to='/verify' />
                                )
                              : (
                                <BusinessProductsList />
                                )}
                        </Route>
                        <Route exact path='/:business_slug/:category_slug/:product_slug'>
                          {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                            ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                            : isUserVerifyRequired && !guestCheckoutEnabled
                              ? (
                                <Redirect to='/verify' />
                                )
                              : (
                                <BusinessProductsList />
                                )}
                        </Route>
                        <Route exact path='/:business_slug/:category_slug'>
                          {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                            ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                            : isUserVerifyRequired && !guestCheckoutEnabled
                              ? (
                                <Redirect to='/verify' />
                                )
                              : (
                                <BusinessProductsList />
                                )}
                        </Route>
                        <Route path='*'>
                          <PageNotFound />
                        </Route>
                      </Switch>
                      )}
                    </IntercomWrapper>
                  </ScrollToTop>
                )}
                {!isTrackingOnly && <PWAPrompt ready={!languageState.loading} />}
                {(!isFooterPage || enabledPoweredByOrdering) && (
                  <Footer isFooterPage={isFooterPage} isHome={isHome} />
                )}
                {auth && (
                  <WebsocketStatus useReconnectByLogin />
                )}
                {(windowSize.width < 576 && onlineStatus && !isTrackingOnly) && (
                  <NavigationBar />
                )}
                <Alert
                  title={t('INFORMATION', 'Information')}
                  content={alertState.content}
                  links={alertState.links}
                  acceptText={t('ACCEPT', 'Accept')}
                  open={alertState.open}
                  onClose={() => closeAlert()}
                  onCancel={() => closeAlert()}
                  onAccept={() => alertState?.isOnlyAlert ? closeAlert() : acceptAlert()}
                  closeOnBackdrop={false}
                />
                {lastOrderReview?.isReviewOpen && (
                  <Modal
                    open={lastOrderReview?.isReviewOpen}
                    onClose={handleCloseReivew}
                    title={lastOrderReview?.order && reviewModalTitle()}
                    width={lastOrderReview?.reviewStatus?.trigger ? '480px' : null}
                    padding='30px 30px'
                    titleStyle={{ padding: '0px' }}
                  >
                    <div>
                      {
                        lastOrderReview?.reviewStatus?.trigger
                          ? <ReviewTrigger order={lastOrderReview?.order} handleOpenOrderReview={handleOpenOrderReview} />
                          : lastOrderReview?.reviewStatus?.order
                            ? <ReviewOrder order={lastOrderReview?.order} defaultStar={lastOrderReview?.defaultStar} closeReviewOrder={closeReviewOrder} setIsReviewed={() => setIsReviewed('isOrderReviewed')} />
                            : (lastOrderReview?.reviewStatus?.product
                                ? <ReviewProduct order={lastOrderReview?.order} closeReviewProduct={closeReviewProduct} setIsProductReviewed={() => setIsReviewed('isProductReviewed')} />
                                : <ReviewDriver order={lastOrderReview?.order} closeReviewDriver={handleCloseReivew} setIsDriverReviewed={() => setIsReviewed('isDriverReviewed')} />)
                      }
                    </div>
                  </Modal>
                )}
                {businessSignUpSuccessed?.open && (
                  <Modal
                    open={businessSignUpSuccessed?.open}
                    onClose={() => acceptAlert()}
                    title={t('CONGRATULATIONS', 'Congratulations')}
                    width='990px'
                  >
                    <SignUpApproval
                      content={businessSignUpSuccessed?.content}
                      onAccept={() => acceptAlert()}
                      onCancel={() => acceptAlert()}
                    />
                  </Modal>
                )}
              </ThemeProvider>
            )
          }
        </div>
        <CookieConsentBanner />
        {hasConsented && themeUpdated?.third_party_code?.body && parse(themeUpdated?.third_party_code?.body, {
          // <script> tags are executed exactly once by the effect above. Skip
          // them here so React-mounted scripts don't double-fire analytics.
          // html-react-parser: null removes the node; <> </> would leave empty fragments.
          replace: (domNode) => (domNode.name === 'script' ? null : undefined)
        })}
      </>
      )
}

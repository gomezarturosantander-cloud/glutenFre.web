import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useTheme } from 'styled-components'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useHistory, useLocation } from 'react-router-dom'

import settings from '../../config'
import { HelmetTags } from '../../components/HelmetTags'
import { parseSearchQueryLocation, resolveSearchQuery, hasValidSearchLocation } from '../../utils/searchQueryLocation'

import {
  HomeContainer,
  MobileFrame,
  SkeletonContainer,
  SkeletonHeader,
  SkeletonContent,
  SkeletonInformation,
  SkeletonSide
} from './styles'

import { useApi } from '~components/contexts/ApiContext'
import { useLanguage } from '~components/contexts/LanguageContext'
import { useSession } from '~components/contexts/SessionContext'
import { useConfig } from '~components/contexts/ConfigContext'
import { useOrder } from '~components/contexts/OrderContext'
import { HomeHero } from '~ui/src/components/HomeHero'
import { HomeCategories } from '~ui/src/components/HomeCategories'
import { PageBanner } from '~ui/src/components/PageBanner'
import { CustomOrderBanner } from '~ui/src/components/CustomOrderBanner'
import { CustomOrderModal } from '~ui/src/components/CustomOrderModal'

export const HomePage = (props) => {
  const history = useHistory()
  const { search } = useLocation()
  const [orderState, { changeType }] = useOrder()
  const urlLocation = useMemo(() => parseSearchQueryLocation(search), [search])
  const [homeState, setHomeState] = useState({ body: null, loading: false, error: null })
  const [showCustomOrder, setShowCustomOrder] = useState(false)
  const [ordering] = useApi()
  const [{ auth }] = useSession()
  const [{ configs }] = useConfig()
  const configTypes = configs?.order_types_allowed?.value?.split('|').map(value => Number(value)) || []
  const customOrderEnabled = auth && configs?.custom_order_enabled?.value === '1'
  const theme = useTheme()
  const [languageState] = useLanguage()

  const requestsState = {}
  const isKioskApp = settings?.use_kiosk
  const languageCode = languageState?.language?.code
  const homeContent = theme?.my_products?.components?.theme_settings?.components?.values?.homepage_content

  const homeContentRef = useRef(null)
  const displayContent = homeState.body || (homeState.useThemeContent && homeContent)

  const handlerFindBusiness = () => {
    const orderLocation = orderState?.options?.address?.location
    history.push(`/search${resolveSearchQuery('', orderLocation, urlLocation)}`)
  }

  const getPage = async () => {
    setHomeState({ body: null, loading: true, error: null, useThemeContent: false })
    try {
      const source = {}
      requestsState.page = source

      if (languageCode) {
        const { content: { error: langError, result: langResult } } = await ordering
          .pages(`homeContent2_${languageCode}`)
          .get({ cancelToken: source })

        if (!langError && langResult?.body && langResult?.enabled) {
          setHomeState({ body: langResult.body, loading: false, error: null, useThemeContent: false })
          return
        }
      }

      if (homeContent) {
        setHomeState({ body: null, loading: false, error: null, useThemeContent: true })
        return
      }

      const { content: { error, result } } = await ordering.pages('homeContent2').get({ cancelToken: source })

      if (!error && result?.body) {
        setHomeState({ body: result.body, loading: false, error: null, useThemeContent: false })
      } else {
        setHomeState({ body: null, loading: false, error: error ? result : null, useThemeContent: false })
      }
    } catch (err) {
      if (err.constructor.name !== 'Cancel') {
        setHomeState({ body: null, loading: false, error: [err.message], useThemeContent: false })
      }
    }
  }

  useEffect(() => {
    if (!isKioskApp) {
      getPage()
    }
    return () => {
      if (requestsState.page) {
        requestsState.page?.cancel?.()
      }
    }
  }, [languageCode])

  const handleHomeContentClick = useCallback(async (event) => {
    const anchor = event.target.closest('a')
    if (!anchor || !homeContentRef.current?.contains(anchor)) return

    const href = anchor.getAttribute('href')
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return

    let url
    try {
      url = new URL(href, window.location.origin)
    } catch {
      return
    }

    if (url.origin !== window.location.origin) return

    event.preventDefault()

    const cityLocation = parseSearchQueryLocation(url.search)
    const isCitySearchLink = url.pathname === '/search' && cityLocation
    const hasOrderLocation = hasValidSearchLocation(orderState?.options?.address?.location)

    if (isCitySearchLink) {
      if (hasOrderLocation) {
        history.push('/search')
        return
      }
      const orderTypeParam = parseInt(url.searchParams.get('order_type') ?? '0', 10)
      if (orderTypeParam && configTypes.includes(orderTypeParam) && orderTypeParam !== orderState?.options?.type) {
        await changeType(orderTypeParam)
      }
      history.push(`${url.pathname}${url.search}${url.hash}`)
      return
    }

    history.push(`${url.pathname}${url.search}${url.hash}`)
  }, [history, orderState?.options?.address?.location, orderState?.options?.type, changeType, configTypes])

  useEffect(() => {
    const node = homeContentRef.current
    if (!node || !displayContent) return

    node.addEventListener('click', handleHomeContentClick)
    return () => node.removeEventListener('click', handleHomeContentClick)
  }, [displayContent, handleHomeContentClick])

  const homeHeroProps = {
    ...props,
    urlLocation,
    onFindBusiness: handlerFindBusiness
  }

  return (
    <>
      <HelmetTags page='home' />
      <HomeContainer>
        <MobileFrame>
          <HomeHero
            {...homeHeroProps}
          />
          <HomeCategories />
          {customOrderEnabled && (
            <CustomOrderBanner onCustomOrderClick={() => setShowCustomOrder(true)} />
          )}
          {
            homeState.loading && (
              <SkeletonContainer>
                <SkeletonHeader>
                  <Skeleton width='100%' height='100%' />
                </SkeletonHeader>
                <SkeletonContent>
                  <SkeletonInformation>
                    <Skeleton width='100%' height='100px' />
                    <Skeleton width='100%' height='100px' />
                    <Skeleton width='100%' height='100px' />
                    <Skeleton width='100%' height='100px' />
                  </SkeletonInformation>
                  <SkeletonSide>
                    <Skeleton width='100%' height='100%' />
                  </SkeletonSide>
                </SkeletonContent>
              </SkeletonContainer>
            )
          }
          {
            displayContent && (
                <div
                  ref={homeContentRef}
                  dangerouslySetInnerHTML={{
                    __html: displayContent
                  }}
                />
            )
          }
          <PageBanner position='web_home_page' />
        </MobileFrame>
      </HomeContainer>
      {customOrderEnabled && (
        <CustomOrderModal
          open={showCustomOrder}
          onClose={() => setShowCustomOrder(false)}
        />
      )}
    </>
  )
}

export default HomePage

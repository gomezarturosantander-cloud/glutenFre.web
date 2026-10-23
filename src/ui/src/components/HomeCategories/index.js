import React, { useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'

import {
  Wrapper,
  SectionsTabs,
  SectionTab,
  SubsectionsGrid,
  SubsectionTile,
  SubsectionImage,
  SubsectionLabel,
  EmptyState,
  MockBadge
} from './styles'

import { BusinessTypeFilter as BusinessTypeFilterController } from '~components/components/BusinessTypeFilter'
import { useLanguage } from '~components/contexts/LanguageContext'
import { useOrder } from '~components/contexts/OrderContext'
import { useSession } from '~components/contexts/SessionContext'

import { Modal } from '~ui/src/components/Modal'
import { AddressForm } from '~ui/src/components/AddressForm'
import { Icon } from '~ui-icon'

import { HOME_SECTION_NAMES, getSubsectionNames } from './sectionsHierarchy'
import { getSubsectionIconComponent } from './subsectionIcons'
import { isHomeCategoriesMockActive, DEV_MOCK_BUSINESS_TYPES } from './devMock'

const typeLabel = (t, type) => t(`BUSINESS_TYPE_${type.name.replace(/\s/g, '_').toUpperCase()}`, type.name)

/**
 * Home: fila de secciones (Comidas/Suplementos/...) + grilla de
 * subsecciones de la sección activa (Desayunos/Almuerzos/...).
 *
 * Datos: business_types reales de la API (GET /business_types), sin
 * jerarquía propia — la relación sección->subsección vive en
 * `sectionsHierarchy.js`, matcheada por nombre exacto. Elegir una sección
 * es solo estado local (cambia qué subsecciones se muestran); elegir una
 * subsección navega a /search filtrado por ESE único business_type
 * (ver src/pages/BusinessesList/index.js).
 */
const HomeCategoriesUI = (props) => {
  const { typesState } = props
  const [, t] = useLanguage()
  const [activeSection, setActiveSection] = useState(null)
  const history = useHistory()
  const [orderState] = useOrder()
  const [{ auth }] = useSession()
  // Subsección elegida mientras se espera que el usuario cargue una
  // dirección: /search exige orderState.options.address.location (ver
  // guard en App.js) o redirige a '/'. Mismo patrón que usa HomeHero.
  const [pendingType, setPendingType] = useState(null)
  const [addressFormLoading, setAddressFormLoading] = useState(false)

  const mockActive = isHomeCategoriesMockActive()
  const types = mockActive ? DEV_MOCK_BUSINESS_TYPES : typesState.types

  const sectionTypes = useMemo(() => (
    HOME_SECTION_NAMES
      .map(name => types.find(type => type.enabled && type.name === name))
      .filter(Boolean)
  ), [types])

  const currentSectionName = sectionTypes.some(type => type.name === activeSection)
    ? activeSection
    : (sectionTypes[0]?.name ?? null)

  const subsectionTypes = useMemo(() => {
    if (!currentSectionName) return []
    return getSubsectionNames(currentSectionName)
      .map(name => types.find(type => type.enabled && type.name === name))
      .filter(Boolean)
  }, [types, currentSectionName])

  const goToFilteredSearch = (type) => {
    history.push(`/search?business_type=${type.id}`)
  }

  const handleSelectSubsection = (type) => {
    if (!orderState?.options?.address?.location) {
      setPendingType(type)
      return
    }
    goToFilteredSearch(type)
  }

  if (typesState.loading && !mockActive) return null

  if (!sectionTypes.length) {
    return (
      <Wrapper>
        <EmptyState>
          <Icon name='image' />
          <span>{t('HOME_CATEGORIES_EMPTY', 'Todavía no hay categorías cargadas.')}</span>
        </EmptyState>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      {mockActive && <MockBadge>MOCK — solo desarrollo</MockBadge>}
      <SectionsTabs>
        {sectionTypes.map(type => (
          <SectionTab
            key={type.id}
            active={type.name === currentSectionName}
            onClick={() => setActiveSection(type.name)}
          >
            {typeLabel(t, type)}
          </SectionTab>
        ))}
      </SectionsTabs>

      {subsectionTypes.length > 0
        ? (
          <SubsectionsGrid>
            {subsectionTypes.map(type => {
              const SubsectionIcon = getSubsectionIconComponent(type.name)
              return (
                <SubsectionTile key={type.id} onClick={() => handleSelectSubsection(type)}>
                  <SubsectionImage className='tile-image'>
                    {type.image
                      ? <img src={type.image} alt={type.name} loading='lazy' />
                      : SubsectionIcon ? <SubsectionIcon /> : <Icon name='image' />}
                  </SubsectionImage>
                  <SubsectionLabel>{typeLabel(t, type)}</SubsectionLabel>
                </SubsectionTile>
              )
            })}
          </SubsectionsGrid>
          )
        : (
          <EmptyState>
            <span>{t('HOME_SUBCATEGORIES_EMPTY', 'Todavía no hay subcategorías para esta sección.')}</span>
          </EmptyState>
          )}

      {pendingType && (
        <Modal
          title={auth ? t('ADD_ADDRESS_TITLE', 'Add address') : t('GUEST', 'Guest')}
          open={!!pendingType}
          onClose={() => { if (!addressFormLoading) setPendingType(null) }}
        >
          <AddressForm
            useValidationFileds
            createGuestOnSave={!auth}
            onLoadingChange={setAddressFormLoading}
            address={orderState?.options?.address || {}}
            onClose={() => { if (!addressFormLoading) setPendingType(null) }}
            onSaveAddress={() => {
              const type = pendingType
              setPendingType(null)
              goToFilteredSearch(type)
            }}
            onCancel={() => { if (!addressFormLoading) setPendingType(null) }}
          />
        </Modal>
      )}
    </Wrapper>
  )
}

export const HomeCategories = (props) => {
  const homeCategoriesProps = {
    ...props,
    UIComponent: HomeCategoriesUI,
    hideAllCategory: true,
    onChangeBusinessType: () => {}
  }
  return <BusinessTypeFilterController {...homeCategoriesProps} />
}

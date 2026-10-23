import { describe, expect, it, vi, beforeEach } from 'vitest'
import { waitFor, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../../__tests__/helpers/testUtils'
import { HomePage } from '../index'

const push = vi.fn()
const changeType = vi.fn()
const mockPagesGet = vi.fn()

let sessionState = { auth: false }
let configState = {
  configs: {
    order_types_allowed: { value: '1|2|3' },
    custom_order_enabled: { value: '0' }
  }
}
let orderState = {
  options: {
    type: 1,
    address: { location: { lat: 40.7, lng: -74.0 } }
  }
}

vi.mock('../../config', () => ({
  default: { use_kiosk: false }
}))
vi.mock('../../../components/HelmetTags', () => ({
  HelmetTags: ({ page }) => <div data-testid='helmet-tags' data-page={page} />
}))
vi.mock('~components/contexts/ApiContext', () => ({
  useApi: () => [{
    pages: vi.fn(() => ({ get: mockPagesGet }))
  }]
}))
vi.mock('~components/contexts/LanguageContext', () => ({
  useLanguage: () => [{ language: { code: 'en' } }]
}))
vi.mock('~components/contexts/SessionContext', () => ({
  useSession: () => [{ auth: sessionState.auth }]
}))
vi.mock('~components/contexts/ConfigContext', () => ({
  useConfig: () => [configState]
}))
vi.mock('~components/contexts/OrderContext', () => ({
  useOrder: () => [orderState, { changeType }]
}))
vi.mock('~ui/src/components/HomeHero', () => ({
  HomeHero: ({ onFindBusiness, urlLocation }) => (
    <div data-testid='home-hero'>
      <button type='button' onClick={onFindBusiness}>find-business</button>
      <span data-testid='url-location'>{urlLocation ? 'has-location' : 'no-location'}</span>
    </div>
  )
}))
vi.mock('~ui/src/components/HomeCategories', () => ({
  HomeCategories: () => <div data-testid='home-categories' />
}))
vi.mock('~ui/src/components/PageBanner', () => ({
  PageBanner: ({ position }) => <div data-testid='page-banner' data-position={position} />
}))
vi.mock('~ui/src/components/CustomOrderBanner', () => ({
  CustomOrderBanner: ({ onCustomOrderClick }) => (
    <button type='button' data-testid='custom-order-banner' onClick={onCustomOrderClick}>
      custom-order
    </button>
  )
}))
vi.mock('~ui/src/components/CustomOrderModal', () => ({
  CustomOrderModal: ({ open }) => (
    open ? <div data-testid='custom-order-modal'>open</div> : null
  )
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useHistory: () => ({ push }),
    useLocation: () => ({ search: '?city=New+York&lat=40.7&lng=-74.0' })
  }
})

describe('HomePage', () => {
  const themeWithHomeContent = {
    colors: {
      primary: '#000',
      backgroundPage: '#fff',
      colorPage: '#000',
      headingColor: '#000',
      lightGray: '#f5f5f5',
      borderColor: '#e9ecef',
      darkTextColor: '#000'
    },
    fonts: { primary: { name: 'Helvetica', weights: [400] } },
    images: {},
    third_party_code: {},
    my_products: {
      components: {
        theme_settings: {
          components: {
            values: {
              homepage_content: '<p>Theme home content</p>'
            }
          }
        }
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    sessionState = { auth: false }
    configState = {
      configs: {
        order_types_allowed: { value: '1|2|3' },
        custom_order_enabled: { value: '0' }
      }
    }
    orderState = {
      options: {
        type: 1,
        address: { location: { lat: 40.7, lng: -74.0 } }
      }
    }
    mockPagesGet.mockResolvedValue({
      content: {
        error: null,
        result: { body: '<p>API home content</p>', enabled: true }
      }
    })
  })

  it('renders HomeHero and page banner', async () => {
    const { getByTestId } = renderWithProviders(<HomePage />, {
      theme: themeWithHomeContent
    })

    expect(getByTestId('helmet-tags')).toHaveAttribute('data-page', 'home')
    expect(getByTestId('home-hero')).toBeInTheDocument()
    expect(getByTestId('page-banner')).toHaveAttribute('data-position', 'web_home_page')
    expect(getByTestId('url-location')).toHaveTextContent('has-location')
  })

  it('loads CMS home content from the API', async () => {
    const { container } = renderWithProviders(<HomePage />, {
      theme: { ...themeWithHomeContent, my_products: { components: { theme_settings: { components: { values: {} } } } } }
    })

    await waitFor(() => {
      expect(container.innerHTML).toContain('API home content')
    })
    expect(mockPagesGet).toHaveBeenCalled()
  })

  it('falls back to theme homepage content when API has no body', async () => {
    mockPagesGet.mockResolvedValue({
      content: { error: true, result: null }
    })

    const { container } = renderWithProviders(<HomePage />, {
      theme: themeWithHomeContent
    })

    await waitFor(() => {
      expect(container.innerHTML).toContain('Theme home content')
    })
  })

  it('navigates to search when find business is clicked', async () => {
    const { getByText } = renderWithProviders(<HomePage />, {
      theme: themeWithHomeContent
    })

    getByText('find-business').click()

    expect(push).toHaveBeenCalledWith(expect.stringContaining('/search'))
  })

  it('shows custom order UI when enabled and user is authenticated', async () => {
    sessionState = { auth: true }
    configState = {
      configs: {
        order_types_allowed: { value: '1|2|3' },
        custom_order_enabled: { value: '1' }
      }
    }

    const { getByTestId } = renderWithProviders(<HomePage />, {
      theme: themeWithHomeContent
    })

    fireEvent.click(getByTestId('custom-order-banner'))
    await waitFor(() => {
      expect(getByTestId('custom-order-modal')).toBeInTheDocument()
    })
  })
})

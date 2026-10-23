import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders, defaultTheme } from '../../../../../__tests__/helpers/testUtils'
import { HomeHero } from '../index'

const sessionState = vi.hoisted(() => ({
  auth: false,
  loading: false,
  login: vi.fn()
}))

vi.mock('~components/contexts/SessionContext', () => ({
  useSession: () => [{ auth: sessionState.auth, loading: sessionState.loading, user: {} }, { login: sessionState.login }]
}))

const orderState = vi.hoisted(() => ({
  current: { options: { address: {} }, loading: false, carts: {} }
}))

vi.mock('~components/contexts/OrderContext', () => ({
  useOrder: () => [orderState.current, { refreshOrderOptions: vi.fn() }]
}))

vi.mock('~ui/hooks/useWindowSize', () => ({
  useWindowSize: () => ({ width: 400, height: 800 })
}))

vi.mock('~ui/src/components/Modal', () => ({
  Modal: ({ open, children, title, authModal }) => (
    open ? <div data-testid={authModal ? 'auth-modal' : 'modal'} data-title={title}>{children}</div> : null
  )
}))
vi.mock('~ui/src/components/AddressForm', () => ({
  AddressForm: () => <div data-testid='address-form' />
}))
vi.mock('~ui/src/components/AddressList', () => ({
  AddressList: () => <div data-testid='address-list' />
}))
vi.mock('~ui/src/components/LoginForm', () => ({
  LoginForm: ({ elementLinkToSignup, elementLinkToForgotPassword }) => (
    <div data-testid='login-form'>
      {elementLinkToSignup}
      {elementLinkToForgotPassword}
    </div>
  )
}))
vi.mock('~ui/src/components/SignUpForm', () => ({
  SignUpForm: () => <div data-testid='signup-form' />
}))
vi.mock('~ui/src/components/ForgotPasswordForm', () => ({
  ForgotPasswordForm: () => <div data-testid='forgot-form' />
}))

const heroTheme = {
  ...defaultTheme,
  images: { general: { homeHero: 'hero.jpg', homeHeroMobile: 'hero-m.jpg' }, logos: { logotypeInvert: 'logo.png' } },
  mobile_view_web: { components: { home: { components: { login_account: { hidden: false } } } } }
}

describe('HomeHero', () => {
  beforeEach(() => {
    sessionState.auth = false
    sessionState.loading = false
    orderState.current = { options: { address: {} }, loading: false, carts: {} }
  })

  it('renders search CTA and opens address modal without location', () => {
    const onFindBusiness = vi.fn()
    const { getByTestId } = renderWithProviders(
      <HomeHero onFindBusiness={onFindBusiness} />,
      { theme: heroTheme }
    )
    expect(getByTestId('icon-search')).toBeInTheDocument()
    fireEvent.click(getByTestId('icon-search'))
    expect(getByTestId('modal')).toBeInTheDocument()
    expect(getByTestId('address-form')).toBeInTheDocument()
    expect(onFindBusiness).not.toHaveBeenCalled()
  })

  it('calls onFindBusiness when address location exists', () => {
    orderState.current = {
      options: { address: { address: '1 Main', location: { lat: 1, lng: 2 } } },
      loading: false,
      carts: {}
    }
    const onFindBusiness = vi.fn()
    const { getByTestId, queryByTestId } = renderWithProviders(
      <HomeHero onFindBusiness={onFindBusiness} />,
      { theme: heroTheme }
    )
    fireEvent.click(getByTestId('icon-search'))
    expect(onFindBusiness).toHaveBeenCalled()
    expect(queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('shows mobile login account actions', () => {
    const { getByText, getByTestId } = renderWithProviders(
      <HomeHero onFindBusiness={vi.fn()} />,
      { theme: heroTheme }
    )
    expect(getByText('Use your account')).toBeInTheDocument()
    fireEvent.click(getByText('login'))
    expect(getByTestId('auth-modal')).toBeInTheDocument()
    expect(getByTestId('login-form')).toBeInTheDocument()
  })

  it('switches auth modal to signup from login link', () => {
    const { getByText, getByTestId } = renderWithProviders(
      <HomeHero onFindBusiness={vi.fn()} />,
      { theme: heroTheme }
    )
    fireEvent.click(getByText('login'))
    fireEvent.click(getByText('Create account'))
    expect(getByTestId('signup-form')).toBeInTheDocument()
  })

  it('renders signup button path', () => {
    const { getByText, getByTestId } = renderWithProviders(
      <HomeHero onFindBusiness={vi.fn()} />,
      { theme: heroTheme }
    )
    fireEvent.click(getByText('signUp'))
    expect(getByTestId('signup-form')).toBeInTheDocument()
  })
})

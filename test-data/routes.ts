/** App paths relative to Playwright `baseURL` (`APP_URL`). */
export enum AppRoute {
  Home = '/',
  Login = '/login',
  Signup = '/signup',
  ForgotPassword = '/forgot-password',
  Dashboard = '/app',
  Calendar = '/calendar',
  Friends = '/friends',
  Communities = '/communities',
  CreateCommunity = '/communities/new',
  /** Maple Class — visited during exploration. */
  CommunityMapleClass = '/communities/15f52f3a-ba2f-46b7-b859-047ed8f6b50f',
  Availability = '/availability',
  Playdates = '/playdates',
  NewPlaydate = '/playdates/new',
  Birthdays = '/birthdays',
  Profile = '/profile',
  Admin = '/admin',
}

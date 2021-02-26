
import '../app/styles/app.global.scss';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#E5E5E5'
      },
      {
        name: 'dark',
        value: '#181817'
      }
    ]
  }
}
const axios = require('axios');
const cookie = require('cookie');

// Log in with the registered user
axios.post('http://localhost:4001/api/v1/users/login', {
  email: 'd@b.com',
  password: 'securePassword123',
})
  .then(response => {
    console.log('Login successful');
    console.log(response.data);
    console.log('----------------');

    // Extract the access token from the response cookies
    const cookies = response.headers['set-cookie'];
    const accessToken = extractAccessTokenFromCookies(cookies);

    // Log out with the access token
    logoutUser(accessToken);
  })
  .catch(error => {
    console.error('Login failed');
    console.error(error.response.data);
    console.error('----------------');
  });

function extractAccessTokenFromCookies(cookies) {
  // Parse the cookies using the cookie module
  const cookiesObj = cookie.parse(cookies.join('; '));
  return cookiesObj.access_token || null;
}

function logoutUser(accessToken) {
  // Make a request to the logout endpoint
  axios.post('http://localhost:4001/api/v1/users/logout', null, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then(response => {
      console.log('Logout successful');
      console.log(response.data);
      console.log('----------------');
    })
    .catch(error => {
      console.error('Logout failed');
      console.error(error.response.data);
      console.error('----------------');
    });
}
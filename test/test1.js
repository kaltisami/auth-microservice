const axios = require('axios');

// Log in with the user credentials
axios.post('http://localhost:4001/api/v1/users/login', {
  email: 'd@b.com',
  password: 'securePassword123',
})
  .then(response => {
    console.log('Login successful');
    console.log(response.data);
    console.log('----------------');

    // Extract the access token and refresh token from the login response
    const { accessToken, refreshToken } = response.data;

    // Set the access token as a cookie in the subsequent requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // Check if the access token is stored in cookies
    if (document.cookie.includes('access_token')) {
      console.log('Access token found in cookies');
      // Perform further actions or validations with the access token stored in cookies
    } else {
      console.log('Access token not found in cookies');
    }

    // Log out by making a POST request to the logout endpoint with the refresh token
    axios.post('http://localhost:4001/api/v1/users/logout', {
      refreshToken: refreshToken,
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
  })
  .catch(error => {
    console.error('Login failed');
    console.error(error.response.data);
    console.error('----------------');
  });

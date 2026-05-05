import axios from 'axios';

// Setup axios defaults for Inertia
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

export default axios;

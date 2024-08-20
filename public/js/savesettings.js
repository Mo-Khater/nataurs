import { showAlert } from './alert';
import axios from 'axios';
export const updateUserData = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'data updated successfully');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

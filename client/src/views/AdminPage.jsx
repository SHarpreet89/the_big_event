import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($username: String!, $email: String!, $password: String!, $role: String!) {
    createUser(username: $username, email: $email, password: $password, role: $role) {
      id
      username
      email
      role
    }
  }
`;

const AdminPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [createUser] = useMutation(CREATE_USER_MUTATION);
  const [statusMessage, setStatusMessage] = useState('');

  const onCreateUser = async (data) => {
    try {
      const response = await createUser({
        variables: {
          username: data.username,
          email: data.email,
          password: data.password,
          role: data.role,
        },
      });
      console.log('Create User Response:', response.data.createUser);
      setStatusMessage('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {statusMessage && <p style={{ color: '#f56565', marginBottom: '1rem' }}>{statusMessage}</p>}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Create User/Planner</h2>
        <form onSubmit={handleSubmit(onCreateUser)}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500' }}>Username</label>
            <input
              style={{ border: '1px solid #e2e8f0', padding: '8px', width: '100%' }}
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && <p style={{ color: '#f56565' }}>{errors.username.message}</p>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500' }}>Email</label>
            <input
              style={{ border: '1px solid #e2e8f0', padding: '8px', width: '100%' }}
              type="email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p style={{ color: '#f56565' }}>{errors.email.message}</p>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
            <input
              style={{ border: '1px solid #e2e8f0', padding: '8px', width: '100%' }}
              type="password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p style={{ color: '#f56565' }}>{errors.password.message}</p>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500' }}>Role</label>
            <select
              style={{ border: '1px solid #e2e8f0', padding: '8px', width: '100%' }}
              {...register('role', { required: 'Role is required' })}
            >
              <option value="">Select a role</option>
              <option value="Planner">Planner</option>
              <option value="Admin">Admin</option>
            </select>
            {errors.role && <p style={{ color: '#f56565' }}>{errors.role.message}</p>}
          </div>

          <button type="submit" style={{ backgroundColor: '#4299e1', color: '#fff', padding: '8px', width: '100%' }}>Create User</button>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;
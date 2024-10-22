import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Updated Login mutation to return user data with the token
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
        role
      }
    }
  }
`;

function Login() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const { setUserRole } = useOutletContext();
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);
  const [error, setError] = React.useState(null);

  const onSubmit = async (data) => {
    try {
      const { data: loginData } = await loginMutation({
        variables: { email: data.email, password: data.password },
      });

      const token = loginData.login.token;
      localStorage.setItem('token', token);

      const user = loginData.login.user;
      const userRole = user.role;
      setUserRole(userRole);
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('userId', user.id); // Save user ID to local storage

      if (userRole === 'Planner') {
        navigate('/planner-dashboard');
      } else if (userRole === 'Client') {
        navigate('/client-dashboard');
      } else if (userRole === 'Admin') {
        navigate('/admin-dashboard');
      } else {
        setError('Unknown user role. Please contact support.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 m-0 p-0">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 text-red-500">
              {error}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
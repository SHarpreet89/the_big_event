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
        _id
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
  const { setUserRole } = useOutletContext(); // Get setUserRole from context
  const [loginMutation, { loading, error }] = useMutation(LOGIN_MUTATION); // Added loading and error for better UX

  const onSubmit = async (data) => {
    try {
      const { data: loginData } = await loginMutation({
        variables: { email: data.email, password: data.password },
      });
  
      const token = loginData.login.token;  
      localStorage.setItem('token', token);
  
      const userRole = loginData.login.user.role; 
      setUserRole(userRole); // Update userRole in context
      localStorage.setItem('userRole', userRole);
  
      // Navigate based on the user role
      if (userRole === 'Planner') {
        navigate('/planner-dashboard');
      } else if (userRole === 'Client') {
        navigate('/client-dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 m-0 p-0">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
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
              {error && <p>Error: {error.message}</p>} {/* Display error if any */}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
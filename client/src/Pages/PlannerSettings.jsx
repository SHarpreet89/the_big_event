import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DatePicker from "@/components/ui/DatePicker"; // Correct import path
import LocationPicker from "@/components/ui/LocationPicker"; // Correct import path

const PlannerSettings = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [eventDate, setEventDate] = useState(null);
  const [eventLocation, setEventLocation] = useState(null);

  const onCreateEvent = (data) => {
    console.log('Create Event Data:', data);
    // Handle event creation logic here
  };

  const onDefineEvent = (data) => {
    console.log('Define Event Data:', data);
    // Handle event definition logic here
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onCreateEvent)}>
            <FormField>
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input {...register('eventName', { required: 'Event name is required' })} />
                </FormControl>
                {errors.eventName && <FormMessage>{errors.eventName.message}</FormMessage>}
              </FormItem>
            </FormField>
            <FormField>
              <FormItem>
                <FormLabel>Event Date</FormLabel>
                <FormControl>
                  <DatePicker selected={eventDate} onChange={setEventDate} />
                </FormControl>
              </FormItem>
            </FormField>
            <FormField>
              <FormItem>
                <FormLabel>Event Location</FormLabel>
                <FormControl>
                  <LocationPicker value={eventLocation} onChange={setEventLocation} />
                </FormControl>
              </FormItem>
            </FormField>
            <FormField>
              <FormItem>
                <FormLabel>Planner</FormLabel>
                <FormControl>
                  <Input {...register('planner', { required: 'Planner is required' })} />
                </FormControl>
                {errors.planner && <FormMessage>{errors.planner.message}</FormMessage>}
              </FormItem>
            </FormField>
            <FormField>
              <FormItem>
                <FormLabel>Clients</FormLabel>
                <FormControl>
                  <Input {...register('clients', { required: 'Clients are required' })} />
                </FormControl>
                {errors.clients && <FormMessage>{errors.clients.message}</FormMessage>}
              </FormItem>
            </FormField>
            <Button type="submit">Create Event</Button>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Define Event</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onDefineEvent)}>
            <FormField>
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input {...register('eventName', { required: 'Event name is required' })} />
                </FormControl>
                {errors.eventName && <FormMessage>{errors.eventName.message}</FormMessage>}
              </FormItem>
            </FormField>
            <FormField>
              <FormItem>
                <FormLabel>Event Date</FormLabel>
                <FormControl>
                  <DatePicker selected={eventDate} onChange={setEventDate} />
                </FormControl>
              </FormItem>
            </FormField>
            <FormField>
              <FormItem>
                <FormLabel>Event Location</FormLabel>
                <FormControl>
                  <LocationPicker value={eventLocation} onChange={setEventLocation} />
                </FormControl>
              </FormItem>
            </FormField>
            <FormField>
              <FormItem>
                <FormLabel>Planner</FormLabel>
                <FormControl>
                  <Input {...register('planner', { required: 'Planner is required' })} />
                </FormControl>
                {errors.planner && <FormMessage>{errors.planner.message}</FormMessage>}
              </FormItem>
            </FormField>
            <FormField>
              <FormItem>
                <FormLabel>Clients</FormLabel>
                <FormControl>
                  <Input {...register('clients', { required: 'Clients are required' })} />
                </FormControl>
                {errors.clients && <FormMessage>{errors.clients.message}</FormMessage>}
              </FormItem>
            </FormField>
            <Button type="submit">Define Event</Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlannerSettings;
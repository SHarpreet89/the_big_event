import { useState } from 'react';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Timeline from '../components/Timeline'; // Import the nested Timeline component
import './PlannerDashboard.css'; // Import the CSS file

import { useQuery, gql } from '@apollo/client';

const GET_CLIENT_EVENTS = gql`
  query GetClientEvents($clientId: ID!) {
    client(id: $clientId) {
      id
      name
      events {
        id
        name
        description
        startDate
        endDate
        location
      }
    }
  }
`;

const ClientEvents = ({ clientId }) => {
  const [events, setEvents] = useState([]); // Define setEvents using useState

  const { loading, error, data } = useQuery(GET_CLIENT_EVENTS, {
    variables: { clientId },
    onCompleted: (data) => {
      setEvents(data?.client?.events || []); // Update state when query completes
    },
  });

  // loading and error states
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching events: {error.message}</p>;

  return (
    <div>
      <div>
        <h2>Events for Client: {data?.client?.name}</h2>
        <ul>
          {events.length > 0 ? (
            events.map((event) => (
              <li key={event.id}>
                <h3>{event.name}</h3>
                <p>{event.description}</p>
                <p>
                  Start: {event.startDate} | End: {event.endDate}
                </p>
                <p>Location: {event.location}</p>
              </li>
            ))
          ) : (
            <p>No events found for this client.</p>
          )}
        </ul>
      </div>

      {/* <div className="PlannerDashboard">
        <div className="top-section">
          <h1>Welcome to The Big Event - {data?.client?.name}</h1>
        </div>
        <div className="middle-section">
          <Timeline events={events} setEvents={setEvents} />
        </div>
        <div className="bottom-section">
          <Carousel
            additionalTransfrom={0}
            arrows
            autoPlaySpeed={3000}
            centerMode={false}
            className=""
            containerClass="container-with-dots"
            dotListClass=""
            draggable
            focusOnSelect={false}
            infinite
            itemClass=""
            keyBoardControl
            minimumTouchDrag={80}
            renderButtonGroupOutside={false}
            renderDotsOutside={false}
            responsive={{
              superLargeDesktop: {
                breakpoint: { max: 4000, min: 3000 },
                items: 5
              },
              desktop: {
                breakpoint: { max: 3000, min: 1024 },
                items: 3
              },
              tablet: {
                breakpoint: { max: 1024, min: 464 },
                items: 2
              },
              mobile: {
                breakpoint: { max: 464, min: 0 },
                items: 1
              }
            }}
            showDots={false}
            sliderClass=""
            slidesToSlide={1}
            swipeable
          >
            {carouselItems}
          </Carousel>
        </div>
      </div> */}
    </div>
  );
};

export default ClientEvents;
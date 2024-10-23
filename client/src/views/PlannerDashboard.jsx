import { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useOutletContext } from 'react-router-dom';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import EventCardWithMap from '../components/EventCardWithMap'; // Ensure correct import
import Timeline from '../components/Timeline';
import './PlannerDashboard.css';

const GET_EVENTS_AND_PLANNER = gql`
  query GetEventsAndPlanner($id: ID!) {
    events {
      id
      name
      description
      startDate
      endDate
      location
      planner {
        id
        name
      }
      clients {
        id
        name
      }
    }
    planner(id: $id) {
      id
      name
    }
  }
`;

function PlannerDashboard() {
  const { showOnlyMyEvents } = useOutletContext();
  const [filteredEvents, setFilteredEvents] = useState([]);
  const plannerId = localStorage.getItem('plannerId');
  const userRole = localStorage.getItem('userRole');

  const { loading, error, data } = useQuery(GET_EVENTS_AND_PLANNER, {
    variables: { id: plannerId },
    skip: !plannerId,
    onCompleted: (data) => {
      console.log('Events and planner fetched:', data);
    }
  });

  const createDateFromTimestamp = (timestamp) => {
    const timestampNumber = parseInt(timestamp, 10);
    if (isNaN(timestampNumber)) {
      console.error('Invalid timestamp:', timestamp);
      return null;
    }
    return new Date(timestampNumber);
  };

  useEffect(() => {
    const filterEvents = () => {
      if (data?.events) {
        let filtered = data.events;
        console.log('All events before filtering:', filtered);

        if (userRole === 'Planner' && showOnlyMyEvents) {
          filtered = filtered.filter(event => {
            const matches = event?.planner?.id === plannerId;
            console.log(`Event ${event.name} planner check:`, {
              eventPlannerId: event?.planner?.id,
              currentPlannerId: plannerId,
              matches
            });
            return matches;
          });
        } else if (userRole === 'Client') {
          const clientId = localStorage.getItem('clientId');
          filtered = filtered.filter(event => 
            event?.clients?.some(client => client?.id === clientId)
          );
        }

        console.log('Filtered events:', filtered);

        const formattedEvents = filtered.map(event => {
          const startDate = createDateFromTimestamp(event.startDate);
          const endDate = createDateFromTimestamp(event.endDate);

          if (!startDate || !endDate) {
            console.error('Invalid dates for event:', event);
            return null;
          }

          return {
            id: event.id,
            title: event.name,
            start: startDate,
            end: endDate,
            description: event.description,
            location: event.location,
            planner: event.planner,
            clients: event.clients
          };
        }).filter(Boolean);

        console.log('Final formatted events:', formattedEvents);
        setFilteredEvents(formattedEvents);
      }
    };

    filterEvents();
  }, [data, showOnlyMyEvents, userRole, plannerId]);

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error loading events: {error.message}</div>;

  const carouselSettings = {
    responsive: {
      superLargeDesktop: {
        breakpoint: { max: 4000, min: 3000 },
        items: Math.min(10, filteredEvents.length) // Adjust to show more items
      },
      desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: Math.min(10, filteredEvents.length) // Adjust to show more items
      },
      tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: Math.min(5, filteredEvents.length) // Adjust to show more items
      },
      mobile: {
        breakpoint: { max: 464, min: 0 },
        items: Math.min(3, filteredEvents.length) // Adjust to show more items
      }
    },
    infinite: filteredEvents.length > 2,
    itemClass: 'carousel-item-padding-10-px', // Adjust padding
    containerClass: 'carousel-container', // Add this line
  };

  const carouselItems = filteredEvents.map(event => (
    <div key={event.id} className="carousel-item">
      <EventCardWithMap event={event} /> {/* Use EventCardWithMap */}
    </div>
  ));

  const plannerName = data?.planner?.name || userRole;

  return (
    <div className="PlannerDashboard planner-dashboard">
      <div className="top-section">
        <h1>Welcome to The Big Event - {plannerName}</h1>
      </div>
      <div className="middle-section">
        <Timeline 
          events={filteredEvents} 
          setEvents={setFilteredEvents}
          userRole={userRole}
          plannerId={plannerId}
        />
      </div>
      <div className="bottom-section">
        {filteredEvents.length > 0 ? (
          <div className="px-4 py-6">
            <Carousel
              {...carouselSettings}
              additionalTransfrom={0}
              arrows
              autoPlaySpeed={3000}
              centerMode={false}
              className="py-4"
              containerClass="container-with-dots"
              draggable
              focusOnSelect={false}
              keyBoardControl
              minimumTouchDrag={80}
              renderButtonGroupOutside={false}
              renderDotsOutside={false}
              showDots={false}
              slidesToSlide={1}
              swipeable
            >
              {carouselItems}
            </Carousel>
          </div>
        ) : (
          <p>No events to display</p>
        )}
      </div>
    </div>
  );
}

export default PlannerDashboard;
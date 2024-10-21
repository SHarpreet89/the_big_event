import { useState } from 'react';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Timeline from '../components/Timeline'; // Import the nested Timeline component
import './PlannerDashboard.css'; // Import the CSS file

function PlannerDashboard() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Event 1',
      start: new Date('2024-10-21T10:00:00'),
      end: new Date('2024-10-21T12:00:00'),
    },
    {
      id: 2,
      title: 'Event 2',
      start: new Date('2024-10-22T14:00:00'),
      end: new Date('2024-10-22T16:00:00'),
    }
  ]);

  const carouselItems = events.map(event => (
    <div key={event.id} className="carousel-item">
      <h3>{event.title}</h3>
      <p>{moment(event.start).format('MMMM Do YYYY, h:mm a')} - {moment(event.end).format('h:mm a')}</p>
    </div>
  ));

  return (
    <div className="PlannerDashboard">
      <div className="top-section">
        <h1>Welcome to The Big Event - Planner Name</h1>
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
    </div>
  );
}

export default PlannerDashboard;
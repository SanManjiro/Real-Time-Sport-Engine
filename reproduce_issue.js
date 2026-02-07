import axios from 'axios';

const testMatch = {
  sport: "Football",
  homeTeam: "Team A",
  awayTeam: "Team B",
  startTime: new Date(Date.now() + 10000).toISOString(),
  endTime: new Date(Date.now() + 20000).toISOString(),
  homeScore: 0,
  awayScore: 0
};

async function reproduce() {
  try {
    const response = await axios.post('http://localhost:3000/matches', testMatch);
    console.log('Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

reproduce();

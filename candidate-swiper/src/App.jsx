import { useState } from 'react'
import styled from '@emotion/styled'
import { AnimatePresence } from 'framer-motion'
import CandidateCard from './components/CandidateCard'
import { candidates } from './data/candidates'

const Container = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 480px) {
    padding: 2px;
    margin-top: -44px;
  }
`

const Header = styled.header`
  text-align: center;
  margin: 0;
`

const Title = styled.h1`
  color: #333;
  margin: 0;
`

const Stats = styled.div`
  display: flex;
  gap: 20px;
  margin: 0;
`

const Stat = styled.div`
  background: white;
  padding: 10px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`

const Instructions = styled.div`
  text-align: center;
  margin: 0;
  color: #666;
`

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [rejectedCandidates, setRejectedCandidates] = useState([])

  const handleSwipe = (direction) => {
    const currentCandidate = candidates[currentIndex]

    switch (direction) {
      case 'right':
        setSelectedCandidates([...selectedCandidates, currentCandidate])
        break
      case 'left':
        setRejectedCandidates([...rejectedCandidates, currentCandidate])
        break
      case 'up':
        // Handle detailed view (can be implemented later)
        console.log('Show details for:', currentCandidate.name)
        break
      case 'down':
        // Handle hide action
        console.log('Hide candidate:', currentCandidate.name)
        break
      default:
        break
    }

    // Move to next candidate
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <Container>

      {/* <Stats>
        <Stat>Выбрано: {selectedCandidates.length}</Stat>
        <Stat>Отклонено: {rejectedCandidates.length}</Stat>
        <Stat>Осталось: {candidates.length - currentIndex}</Stat>
      </Stats> */}

      <AnimatePresence>
        {currentIndex < candidates.length && (
          <CandidateCard
            key={candidates[currentIndex].id}
            candidate={candidates[currentIndex]}
            onSwipe={handleSwipe}
          />
        )}
      </AnimatePresence>

    </Container>
  )
}

export default App

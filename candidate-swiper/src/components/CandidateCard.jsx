import { useSwipeable } from 'react-swipeable';
import styled from '@emotion/styled';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useState } from 'react';
import CandidateModal from './CandidateModal';

const Card = styled(motion.div)`
  width: 100%;
  // max-width: 800px;
  background: white;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  position: relative;
  margin: 30px auto;
  touch-action: none;
  cursor: grab;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &:active {
    cursor: grabbing;
  }
  
  @media (max-width: 1024px) {
    max-width: 600px;
    padding: 25px;
    margin: 20px auto;
  }
  
  @media (max-width: 768px) {
    max-width: 500px;
    padding: 20px;
    margin: 15px auto;
  }
  
  @media (max-width: 480px) {
    max-width: 100%;
    margin: 10px;
    padding: 15px;
    border-radius: 20px;
  }
`;

const SwipeOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  pointer-events: none;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 30vh;
`;

const SwipeIcon = styled(motion.div)`
  font-size: 48px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 480px) {
    font-size: 36px;
  }
`;

const PhotoSection = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 25px;
  width: 100%;
  position: relative;
  
  @media (max-width: 1024px) {
    gap: 20px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 768px) {
    gap: 16px;
    margin-bottom: 18px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 15px;
  }
`;

const PhotoColumn = styled.div`
  flex: 0.8;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  
  @media (max-width: 768px) {
    flex: 0.7;
  }
`;

const InfoColumn = styled.div`
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const Photo = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  
  @media (max-width: 1024px) {
    width: 150px;
    height: 150px;
  }
  
  @media (max-width: 768px) {
    width: 130px;
    height: 130px;
  }
  
  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
    border-radius: 16px;
  }
`;

const Title = styled.h2`
  font-size: 32px;
  margin: 0 0 8px;
  text-align: center;
  color: #333;
  font-weight: 600;
  
  @media (max-width: 1024px) {
    font-size: 28px;
  }
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const Company = styled.div`
  font-size: 22px;
  color: #666;
  text-align: center;
  margin-bottom: 8px;
  
  @media (max-width: 1024px) {
    font-size: 20px;
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const City = styled.div`
  font-size: 16px;
  color: #888;
  text-align: center;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  
  .icon {
    font-size: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const Experience = styled.div`
  font-size: 16px;
  color: #888;
  text-align: center;
  margin-bottom: 15px;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const Subtitle = styled.h3`
  font-size: 18px;
  margin: 0 0 15px;
  text-align: center;
  color: #666;
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const Salary = styled(motion.div)`
  font-size: 24px;
  font-weight: bold;
  color: #2e7d32;
  text-align: center;
  padding: 12px;
  background: linear-gradient(45deg, rgba(46, 125, 50, 0.1), rgba(76, 175, 80, 0.1));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15);
  width: 100%;
  
  .amount {
    background: linear-gradient(45deg, #2e7d32, #4caf50);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  @media (max-width: 1024px) {
    font-size: 22px;
    padding: 10px;
  }
  
  @media (max-width: 768px) {
    font-size: 20px;
    padding: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
    padding: 6px;
  }
`;

const InfoSection = styled.div`
  display: flex;
  align-items: center;
  margin: 8px 0;
  font-size: 16px;
  color: #555;
  
  .icon {
    font-size: 20px;
    margin-right: 10px;
    color: #666;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    margin: 6px 0;
  }
`;

const InfoText = styled.div`
  flex: 1;
`;

const UnreadMessageIndicator = styled(motion.div)`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #f44336;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(244, 67, 54, 0.3);
  cursor: pointer;
  z-index: 2;
  
  &:hover {
    transform: scale(1.1);
    background: #e53935;
  }
  
  @media (max-width: 480px) {
    width: 20px;
    height: 20px;
    font-size: 10px;
    top: -6px;
    right: -6px;
  }
`;

const WorkHistorySection = styled.div`
  background: rgba(33, 150, 243, 0.1);
  padding: 25px;
  border-radius: 20px;
  margin: 20px 0;
  width: 100%;
  
  @media (max-width: 1024px) {
    padding: 20px;
    margin: 15px 0;
  }
  
  @media (max-width: 768px) {
    padding: 15px;
    margin: 12px 0;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    margin: 10px 0;
  }
`;

const WorkHistoryTitle = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #1976d2;
  margin-bottom: 10px;
  font-weight: 500;
  
  .icon {
    margin-right: 8px;
    font-size: 20px;
  }
`;

const WorkHistoryItem = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin: 12px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  .company-icon {
    font-size: 24px;
    margin-right: 12px;
    color: #1976d2;
  }
  
  .info {
    flex: 1;
  }
  
  .company {
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }
  
  .position {
    font-size: 14px;
    color: #666;
    margin-bottom: 4px;
  }
  
  .period {
    font-size: 13px;
    color: #888;
    margin-bottom: 4px;
  }
  
  .description {
    font-size: 13px;
    color: #666;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .duration {
    background: rgba(33, 150, 243, 0.1);
    color: #1976d2;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 13px;
    margin-left: 8px;
  }
  
  @media (max-width: 1024px) {
    padding: 16px;
    margin: 10px 0;
  }
  
  @media (max-width: 768px) {
    padding: 14px;
    margin: 8px 0;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    margin: 6px 0;
  }
`;

const WorkSkills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const WorkSkill = styled.div`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => {
    const relevance = props.relevance;
    if (relevance >= 90) return 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)';
    if (relevance >= 80) return 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)';
    if (relevance >= 70) return 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)';
    return 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)';
  }};
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.9;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: translateY(-1px);
  }

  &::after {
    content: '${props => props.relevance}%';
    font-size: 10px;
    opacity: 0.8;
  }
`;

const Skills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 15px 0;
  
  @media (max-width: 1024px) {
    gap: 8px;
    margin: 12px 0;
  }
  
  @media (max-width: 768px) {
    gap: 6px;
    margin: 10px 0;
  }
  
  @media (max-width: 480px) {
    gap: 4px;
    margin: 8px 0;
  }
`;

const Skill = styled.div`
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 16px;
  background: ${props => {
    const relevance = props.relevance;
    if (relevance >= 90) return 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)';
    if (relevance >= 80) return 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)';
    if (relevance >= 70) return 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)';
    return 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)';
  }};
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.9;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &::after {
    content: '${props => props.relevance}%';
    font-size: 14px;
    opacity: 0.8;
  }
  
  @media (max-width: 1024px) {
    font-size: 15px;
    padding: 7px 14px;
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 6px 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 4px 8px;
  }
`;

const MatchScore = styled(motion.div)`
  position: relative;
  color: white;
  padding: 8px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: ${props => {
    const score = props.score;
    if (score >= 80) return 'linear-gradient(45deg, #4CAF50, #45a049)';
    if (score >= 60) return 'linear-gradient(45deg, #FFA726, #FB8C00)';
    return 'linear-gradient(45deg, #EF5350, #E53935)';
  }};
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  
  .icon {
    font-size: 16px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
  
  .score {
    position: relative;
    padding-left: 4px;
    
    &:before {
      content: '';
      position: absolute;
      left: -2px;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      height: 70%;
      background: rgba(255, 255, 255, 0.3);
    }
  }
  
  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    padding: 6px;
    
    .icon {
      font-size: 14px;
    }
  }
`;

const AboutSection = styled.div`
  background: rgba(33, 150, 243, 0.05);
  padding: 20px;
  border-radius: 16px;
  margin: 15px 0;
  position: relative;
  max-height: 120px;
  overflow: hidden;
  transition: max-height 0.3s ease;
  cursor: pointer;
  
  &.expanded {
    max-height: 800px;
  }
  
  @media (max-width: 1024px) {
    padding: 16px;
    margin: 12px 0;
    max-height: 100px;
  }
  
  @media (max-width: 768px) {
    padding: 14px;
    margin: 10px 0;
    max-height: 90px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    margin: 8px 0;
    max-height: 80px;
  }
`;

const AboutContent = styled.div`
  font-size: 18px;
  color: #555;
  line-height: 1.6;
  
  @media (max-width: 1024px) {
    font-size: 16px;
  }
  
  @media (max-width: 768px) {
    font-size: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const CandidateCard = ({ candidate, onSwipe }) => {
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Motion values for drag tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform motion values for visual effects
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  
  // Calculate overlay opacities
  const leftOverlayOpacity = useTransform(x, [-200, 0], [0.8, 0]);
  const rightOverlayOpacity = useTransform(x, [0, 200], [0, 0.8]);
  const upOverlayOpacity = useTransform(y, [-200, 0], [0.8, 0]);
  const downOverlayOpacity = useTransform(y, [0, 200], [0, 0.8]);

  const handleDragEnd = async (event, info) => {
    const { offset } = info;
    const threshold = 100;
    
    // Determine the dominant direction
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);
    let direction;
    
    if (absX > absY) {
      direction = offset.x > 0 ? 'right' : 'left';
    } else {
      direction = offset.y > 0 ? 'down' : 'up';
    }
    
    if (absX > threshold || absY > threshold) {
      if (direction === 'up') {
        setShowModal(true);
        controls.start({
          x: 0,
          y: 0,
          rotate: 0,
          transition: { duration: 0.3 }
        });
      } else {
        await controls.start({
          x: direction === 'right' ? 500 : direction === 'left' ? -500 : 0,
          y: direction === 'down' ? 500 : 0,
          opacity: 0,
          transition: { duration: 0.3 }
        });
        onSwipe(direction);
      }
    } else {
      // Return to center if threshold not met
      controls.start({
        x: 0,
        y: 0,
        rotate: 0,
        transition: { duration: 0.3 }
      });
    }
    
    setIsDragging(false);
  };

  return (
    <>
      <Card
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, y, rotate }}
        initial={{ scale: 0.9, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <SwipeOverlay
          style={{
            background: 'linear-gradient(45deg, #ff4444,rgb(202, 132, 26))',
            opacity: leftOverlayOpacity
          }}
        >
          <SwipeIcon>🗑️</SwipeIcon>
        </SwipeOverlay>
        <SwipeOverlay
          style={{
            background: 'linear-gradient(45deg, #44ff44,rgb(9, 100, 14))',
            opacity: rightOverlayOpacity
          }}
        >
          <SwipeIcon>✓</SwipeIcon>
        </SwipeOverlay>
        <SwipeOverlay
          style={{
            background: 'linear-gradient(45deg, #4444ff, #ffaa44)',
            opacity: upOverlayOpacity
          }}
        >
          <SwipeIcon>👁️</SwipeIcon>
        </SwipeOverlay>
        <SwipeOverlay
          style={{
            background: 'linear-gradient(45deg, #ffaa44, #4444ff)',
            opacity: downOverlayOpacity
          }}
        >
          <SwipeIcon>↓</SwipeIcon>
        </SwipeOverlay>

        <PhotoSection>
          <PhotoColumn>
            <Photo src={candidate.photoUrl} alt={candidate.name} />
            {candidate.hasCoverLetter && (
              <UnreadMessageIndicator
                onClick={() => setShowModal(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 15
                }}
              >
                1
              </UnreadMessageIndicator>
            )}
          </PhotoColumn>
          <InfoColumn>
            <Salary
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <span className="amount">{candidate.expectedSalary}</span>
            </Salary>
            
            <MatchScore 
              score={candidate.matchScore}
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <span className="icon">🤖</span>
              <span className="score">{candidate.matchScore}%</span>
            </MatchScore>
          </InfoColumn>
        </PhotoSection>

        <Title>{candidate.position}</Title>
        <Company>
          {candidate.name}, {candidate.company}, {candidate.currentCompanyExperience}, {candidate.city}
        </Company>

        <AboutSection 
          className={expanded ? 'expanded' : ''} 
          expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <AboutContent>{candidate.about.short}</AboutContent>
        </AboutSection>

        <Skills>
          {candidate.skills
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 6)
            .map((skill, index) => (
              <Skill key={index} relevance={skill.relevance}>
                {skill.name}
              </Skill>
            ))}
          {candidate.skills.length > 6 && (
            <Skill relevance={50}>
              +{candidate.skills.length - 6}
            </Skill>
          )}
        </Skills>
        <WorkHistorySection>
          <WorkHistoryTitle>
            <span className="icon">📈</span>
            Опыт работы ({candidate.experience})
          </WorkHistoryTitle>
          {candidate.workHistory.map((work, index) => (
            <WorkHistoryItem
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="company-icon">🏢</span>
                <div className="info">
                  <div className="company">{work.company}</div>
                  <div className="position">{work.position}</div>
                  <div className="period">{work.period}</div>
                </div>
                <div className="duration">{work.duration}</div>
              </div>
              {work.description && (
                <div className="description">{work.description}</div>
              )}
              <WorkSkills>
                {work.skills
                  .sort((a, b) => b.relevance - a.relevance)
                  .slice(0, 5)
                  .map((skill, skillIndex) => (
                    <WorkSkill key={skillIndex} relevance={skill.relevance}>
                      {skill.name}
                    </WorkSkill>
                  ))}
                {work.skills.length > 5 && (
                  <WorkSkill relevance={60}>
                    +{work.skills.length - 5}
                  </WorkSkill>
                )}
              </WorkSkills>
            </WorkHistoryItem>
          ))}
        </WorkHistorySection>
      </Card>

      {showModal && (
        <CandidateModal
          candidate={candidate}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default CandidateCard; 
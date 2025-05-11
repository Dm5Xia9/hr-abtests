import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  padding: 10px;
  overflow-y: auto;
  
  @media (max-width: 480px) {
    padding: 5px;
  }
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 20px;
  max-width: 800px;
  width: 100%;
  margin: 10px auto;
  position: relative;
  
  @media (max-width: 480px) {
    padding: 15px;
    margin: 5px auto;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  
  &:hover {
    color: #333;
  }
  
  @media (max-width: 480px) {
    top: 15px;
    right: 15px;
    font-size: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    gap: 15px;
    margin-bottom: 15px;
  }
`;

const Photo = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
    border-radius: 12px;
  }
`;

const Info = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  font-size: 24px;
  margin: 0 0 10px;
  color: #333;
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const Company = styled.div`
  font-size: 18px;
  color: #666;
  margin-bottom: 5px;
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const City = styled.div`
  font-size: 16px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 15px;
  
  .icon {
    font-size: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const Salary = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 15px;
  padding: 8px;
  background: linear-gradient(45deg, rgba(46, 125, 50, 0.1), rgba(76, 175, 80, 0.1));
  border-radius: 10px;
  display: inline-block;
  
  @media (max-width: 480px) {
    font-size: 18px;
    padding: 6px;
  }
`;

const MatchScore = styled.div`
  display: inline-block;
  color: white;
  padding: 8px 15px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  margin-left: 10px;
  background: ${props => {
    const score = props.score;
    if (score >= 80) return 'linear-gradient(45deg, #4CAF50, #45a049)';
    if (score >= 60) return 'linear-gradient(45deg, #FFA726, #FB8C00)';
    return 'linear-gradient(45deg, #EF5350, #E53935)';
  }};
  
  @media (max-width: 480px) {
    font-size: 14px;
    padding: 6px 12px;
  }
`;

const Section = styled.div`
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    margin-bottom: 15px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  color: #1976d2;
  margin: 0 0 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  .icon {
    font-size: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const AboutSection = styled(Section)`
  background: rgba(33, 150, 243, 0.05);
  padding: 15px;
  border-radius: 12px;
`;

const CoverLetter = styled(Section)`
  background: rgba(76, 175, 80, 0.05);
  padding: 15px;
  border-radius: 12px;
  margin-top: 20px;
  
  .content {
    white-space: pre-line;
    line-height: 1.6;
    color: #333;
  }
`;

const Skills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const Skill = styled.div`
  font-size: 14px;
  padding: 6px 12px;
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
  
  &::after {
    content: '${props => props.relevance}%';
    font-size: 12px;
    opacity: 0.8;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 4px 10px;
  }
`;

const WorkHistoryItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .company {
    font-weight: 500;
    color: #333;
    margin-bottom: 5px;
  }
  
  .position {
    color: #666;
    margin-bottom: 5px;
  }
  
  .period {
    color: #888;
    font-size: 14px;
    margin-bottom: 10px;
  }
  
  .description {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .duration {
    background: rgba(33, 150, 243, 0.1);
    color: #1976d2;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 13px;
    display: inline-block;
    margin-left: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    margin-bottom: 10px;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
  
  @media (max-width: 480px) {
    gap: 10px;
    margin-top: 10px;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  
  .icon {
    font-size: 18px;
    color: #1976d2;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const AnalysisSection = styled(Section)`
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(33, 150, 243, 0.1));
  padding: 20px;
  border-radius: 16px;
  margin: 20px 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #2196f3, #64b5f6);
  }
`;

const AnalysisTitle = styled(SectionTitle)`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  
  .icon {
    font-size: 24px;
    background: linear-gradient(135deg, #2196f3, #64b5f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const AnalysisSummary = styled.div`
  background: white;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-size: 16px;
  line-height: 1.6;
  color: #333;
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AnalysisColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const AnalysisItem = styled.div`
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: flex-start;
  gap: 10px;
  
  .icon {
    font-size: 20px;
    flex-shrink: 0;
  }
  
  .text {
    font-size: 14px;
    line-height: 1.5;
    color: #333;
  }
`;

const CandidateModal = ({ candidate, onClose }) => {
  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContent
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <CloseButton onClick={onClose}>×</CloseButton>
          
          <Header>
            <Photo src={candidate.photoUrl} alt={candidate.name} />
            <Info>
              <Title>{candidate.position}</Title>
              <Company>{candidate.name}, {candidate.company}</Company>
              <City>
                <span className="icon">📍</span>
                {candidate.city}
              </City>
              <Salary>{candidate.expectedSalary}</Salary>
              <MatchScore score={candidate.matchScore}>
                <span className="icon">🤖</span>
                {candidate.matchScore}%
              </MatchScore>
            </Info>
          </Header>

          <AnalysisSection>
            <AnalysisTitle>
              <span className="icon">🤖</span>
              Анализ нейросети
            </AnalysisTitle>
            
            <AnalysisSummary>
              {candidate.analysis.summary}
            </AnalysisSummary>
            
            <AnalysisGrid>
              <AnalysisColumn>
                <AnalysisTitle style={{ fontSize: '16px', marginBottom: '10px' }}>
                  <span className="icon">✨</span>
                  Сильные стороны
                </AnalysisTitle>
                {candidate.analysis.pros.map((pro, index) => (
                  <AnalysisItem key={index}>
                    <span className="icon">✅</span>
                    <div className="text">{pro}</div>
                  </AnalysisItem>
                ))}
              </AnalysisColumn>
              
              <AnalysisColumn>
                <AnalysisTitle style={{ fontSize: '16px', marginBottom: '10px' }}>
                  <span className="icon">⚠️</span>
                  Области для роста
                </AnalysisTitle>
                {candidate.analysis.cons.map((con, index) => (
                  <AnalysisItem key={index}>
                    <span className="icon">🔍</span>
                    <div className="text">{con}</div>
                  </AnalysisItem>
                ))}
              </AnalysisColumn>
            </AnalysisGrid>
          </AnalysisSection>

          <AboutSection>
            <SectionTitle>
              <span className="icon">👤</span>
              О себе
            </SectionTitle>
            <div>{candidate.about.full}</div>
          </AboutSection>

          {candidate.hasCoverLetter && (
            <CoverLetter>
              <SectionTitle>
                <span className="icon">✉️</span>
                Сопроводительное письмо
              </SectionTitle>
              <div className="content">{candidate.coverLetter}</div>
            </CoverLetter>
          )}

          <Section>
            <SectionTitle>
              <span className="icon">🛠️</span>
              Навыки
            </SectionTitle>
            <Skills>
              {candidate.skills
                .sort((a, b) => b.relevance - a.relevance)
                .map((skill, index) => (
                  <Skill key={index} relevance={skill.relevance}>
                    {skill.name}
                  </Skill>
                ))}
            </Skills>
          </Section>

          <Section>
            <SectionTitle>
              <span className="icon">📈</span>
              Опыт работы ({candidate.experience})
            </SectionTitle>
            {candidate.workHistory.map((work, index) => (
              <WorkHistoryItem key={index}>
                <div className="company">{work.company}</div>
                <div className="position">{work.position}</div>
                <div className="period">
                  {work.period}
                  <span className="duration">{work.duration}</span>
                </div>
                {work.description && (
                  <div className="description">{work.description}</div>
                )}
                <Skills>
                  {work.skills
                    .sort((a, b) => b.relevance - a.relevance)
                    .map((skill, skillIndex) => (
                      <Skill key={skillIndex} relevance={skill.relevance}>
                        {skill.name}
                      </Skill>
                    ))}
                </Skills>
              </WorkHistoryItem>
            ))}
          </Section>
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default CandidateModal; 
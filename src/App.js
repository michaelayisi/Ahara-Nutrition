import Pages from "./pages/Pages";
import styled from "styled-components";
import AharaLogo from "./assets/img/logo.jpg"
import { useNavigate } from "react-router-dom";

const App = () => {
  const navigate = useNavigate();

  const handleLogo = () => {
    navigate('/')
  }

  return (
    <div>
      <Nav>
        <Logo>
          <img src={AharaLogo} onClick={handleLogo} style={{cursor: "pointer"}} width="200px" />
        </Logo>
      </Nav>
      <Pages />
    </div>
  );
};

const Nav = styled.div`
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  svg {
    font-size: 2rem;
  }
`;
const Logo = styled.div`
  display: flex;
`;

export default App;

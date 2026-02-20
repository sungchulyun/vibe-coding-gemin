import React from 'react';

const Header: React.FC = () => {
  const headerStyle: React.CSSProperties = {
    backgroundColor: '#f8f9fa', // 밝은 회색 배경
    color: '#212529',           // 눈에 잘 띄는 어두운 텍스트
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  return (
    <header style={headerStyle}>
      <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        Gemini-BizTalk
      </div>
      <nav>
        <ul style={{ display: 'flex', listStyle: 'none', gap: '1rem' }}>
          <li><a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</a></li>
          <li><a href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

import React from 'react'
import './Navbar.css'
import logo from '../../assets/logo.png'
import navlogo from '../../assets/nav-logo.svg'
import navProfile from '../../assets/nav-profile.svg'

const Navbar = () => {
  return (
    <div className='navbar'>
      <div className='nav-logo'>
        <img src={logo} alt=""/>
        <p>Eleganza</p>
      </div>
      <img src={navProfile} alt="" className='nav-profile'/>
    </div>
  )
}

export default Navbar


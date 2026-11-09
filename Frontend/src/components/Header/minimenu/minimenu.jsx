import { useState } from 'react'
import './minimenu.css'
import qrLogo from '../../../assets/qr_logo.png';

function MiniMenu() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="minimenu">
            <button
                className="minimenu__button"
                type="button"
                aria-expanded={isOpen}
                aria-controls="minimenu-list"
                onClick={() => setIsOpen(!isOpen)}
            >
                Menu
            </button>
            {isOpen && (
                <ul className="minimenu__list" id="minimenu-list">
                    <li className="minimenu__item">Charlas</li>
                    <li className="minimenu__item">
                        <img src={qrLogo} alt="" />
                        <a href="">QR</a>
                    </li>
                    
                    <li className="minimenu__item">Datos de empresa</li>
                </ul>
            )}
            </div>
    )
}
export default MiniMenu;
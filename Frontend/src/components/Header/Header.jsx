import './Header.css';
import reactLogo from '../../assets/react.svg'

function Header() {
    return (
        
            <nav className="Cabecera">
            <a href={reactLogo} className="Logo">
                <img src={reactLogo} alt="React logo" />
            </a>
            {/* Logo de Usuaruio */}
            <a href="./assets/vite.svg" className= "Account">Aqui logo de cuenta</a>

            </nav>
           
            )
}
export default Header;
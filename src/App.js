import logo from './logo.svg';
import './App.css';
import AppRoutes from './routes/AppRoutes';
import Layout from './components/Layout';
import Home from './pages/Home';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from './context/Snackbar';
import { UserProvider } from './context/UserContext';
import MainLp from './landingpage/MainLp';


function App() {
  return (
    <BrowserRouter>
    <UserProvider>
     <SnackbarProvider>
        {/* <Layout> */}
          <AppRoutes/>
        {/* </Layout> */}
      </SnackbarProvider>
    </UserProvider>
    </BrowserRouter>
  );
}

export default App;


// package json default 
  // "scripts": {
  //   "start": "react-scripts start",
  //   "build": "react-scripts build",
  //   "test": "react-scripts test",
  //   "eject": "react-scripts eject"
  // },
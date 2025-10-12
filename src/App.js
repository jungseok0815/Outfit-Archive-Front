
import './App.css';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Main from './pages/user/userMain/UserMain';
import Admin from './pages/admin/AdminMainPage';
import Auth from './pages/auth/AuthPage';
import PrivateMasterRoute from './routes/PrivateMasterRoute';
import { AuthProvider } from './store/context/UserContext';


function App() {

  return (
      <div className="App">
          <div>
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path='/' element={<Main/>}/>
                  <Route path='/auth' element={<Auth/>}/>
                  <Route path='/admin' element={<PrivateMasterRoute component={<Admin />}/>}/>
                  </Routes>
              </BrowserRouter>  
            </AuthProvider>
          </div>
      </div>
   
  );
}

export default App;
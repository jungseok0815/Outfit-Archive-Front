
import './App.css';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Main from './pages/user/userMain/UserMain';
import ShopPage from './pages/user/shop/ShopPage';
import StylePage from './pages/user/style/StylePage';
import Admin from './pages/admin/AdminMainPage';
import PrivateMasterRoute from './routes/PrivateMasterRoute';
import MyPage from './pages/user/mypage/MyPage';
import { AuthProvider } from './store/context/UserContext';


function App() {

  return (
      <div className="App">
          <div>
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path='/' element={<Main/>}/>
                  <Route path='/shop' element={<ShopPage/>}/>
                  <Route path='/style' element={<StylePage/>}/>
                  <Route path='/mypage' element={<MyPage/>}/>
                  <Route path='/admin' element={<PrivateMasterRoute component={<Admin />}/>}/>
                  </Routes>
              </BrowserRouter>
            </AuthProvider>
          </div>
      </div>

  );
}

export default App;

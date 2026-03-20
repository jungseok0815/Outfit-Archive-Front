
import './App.css';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Main from './pages/user/userMain/UserMain';
import ShopPage from './pages/user/shop/ShopPage';
import ProductDetailPage from './pages/user/shop/ProductDetailPage';
import StylePage from './pages/user/style/StylePage';
import Admin from './pages/admin/AdminMainPage';
import PrivateMasterRoute from './routes/PrivateMasterRoute';
import PrivateUserRoute from './routes/PrivateUserRoute';
import MyPage from './pages/user/mypage/MyPage';
import SearchPage from './pages/user/search/SearchPage';
import PaymentSuccessPage from './pages/user/payment/PaymentSuccessPage';
import PaymentFailPage from './pages/user/payment/PaymentFailPage';
import { AuthProvider } from './store/context/UserContext';


function App() {

  return (
      <div className="App">
          <div>
            <AuthProvider>
              <BrowserRouter>
                <ToastContainer position="top-center" autoClose={2500} hideProgressBar={false} closeOnClick pauseOnHover />
                <Routes>
                  <Route path='/' element={<Main/>}/>
                  <Route path='/shop' element={<ShopPage/>}/>
                  <Route path='/shop/:productId' element={<ProductDetailPage/>}/>
                  <Route path='/style' element={<StylePage/>}/>
                  <Route path='/search' element={<SearchPage/>}/>
                  <Route path='/mypage' element={<PrivateUserRoute component={<MyPage/>}/>}/>
                  <Route path='/mypage/:userId' element={<MyPage/>}/>
                  <Route path='/payment/success' element={<PaymentSuccessPage/>}/>
                  <Route path='/payment/fail' element={<PaymentFailPage/>}/>
                  <Route path='/admin' element={<PrivateMasterRoute component={<Admin />}/>}/>
                  </Routes>
              </BrowserRouter>
            </AuthProvider>
          </div>
      </div>

  );
}

export default App;

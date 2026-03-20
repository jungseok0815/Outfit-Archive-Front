import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from '../../../components/user/header/Header';
import AuthModal from '../auth/AuthPage';
import ProductCard from '../../../components/user/card/ProductCard';
import StyleCard from '../../../components/user/card/StyleCard';
import PostDetailPanel from '../mypage/PostDetailPanel';
import { ListProduct } from '../../../api/user/product';
import { SearchPost, ToggleLike } from '../../../api/user/post';
import { GetWishlistProductIds } from '../../../api/user/wishlist';
import { useAuth } from '../../../store/context/UserContext';
import "../../../App.css";
import "./SearchPage.css";

const PAGE_SIZE = 12;

const mapProduct = (p) => ({
  id: p.id,
  image: p.images?.length > 0 ? p.images[0].imgPath : '',
  brand: p.brandNm,
  name: p.productNm,
  price: p.productPrice?.toLocaleString(),
  _raw: p,
});

const mapPost = (p) => ({
  id: p.id,
  userId: p.userId,
  user: p.userNm,
  avatar: p.profileImgNm || null,
  image: p.images?.length > 0 ? p.images[0].imgPath : '',
  images: p.images?.length > 0 ? p.images.map(img => img.imgPath) : [],
  title: p.title,
  content: p.content || '',
  likes: p.likeCount,
  liked: p.liked || false,
  comments: p.commentCount,
  products: p.products || [],
});

function SearchPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get("keyword") || "";

  const [activeTab, setActiveTab] = useState("products");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // 상품
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(0);
  const [productHasMore, setProductHasMore] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState([]);

  // 스타일
  const [posts, setPosts] = useState([]);
  const [postPage, setPostPage] = useState(0);
  const [postHasMore, setPostHasMore] = useState(true);
  const [postLoading, setPostLoading] = useState(false);

  const productLoadingRef = useRef(false);
  const postLoadingRef = useRef(false);
  const productObserverRef = useRef(null);
  const postObserverRef = useRef(null);

  // 위시리스트
  useEffect(() => {
    if (!user) return;
    GetWishlistProductIds().then(setWishlistedIds).catch(() => {});
  }, [user]);

  // 키워드 변경 시 상품 초기 로드
  useEffect(() => {
    if (!keyword) return;
    setProducts([]);
    setProductPage(0);
    setProductHasMore(true);
    setProductLoading(true);
    productLoadingRef.current = true;

    ListProduct(keyword, null, 0, PAGE_SIZE)
      .then(res => {
        const data = res.data;
        setProducts((data.content || []).map(mapProduct));
        setProductHasMore(!data.last);
      })
      .catch(e => console.error('상품 검색 실패:', e))
      .finally(() => { setProductLoading(false); productLoadingRef.current = false; });
  }, [keyword]);

  // 키워드 변경 시 게시물 초기 로드
  useEffect(() => {
    if (!keyword) return;
    setPosts([]);
    setPostPage(0);
    setPostHasMore(true);
    setPostLoading(true);
    postLoadingRef.current = true;

    SearchPost(keyword, 0, PAGE_SIZE)
      .then(res => {
        const data = res.data;
        setPosts((data.content || []).map(mapPost));
        setPostHasMore(!data.last);
      })
      .catch(e => console.error('스타일 검색 실패:', e))
      .finally(() => { setPostLoading(false); postLoadingRef.current = false; });
  }, [keyword]);

  // 상품 무한스크롤
  const loadMoreProducts = useCallback(() => {
    if (productLoadingRef.current || !productHasMore) return;
    const nextPage = productPage + 1;
    setProductPage(nextPage);
    productLoadingRef.current = true;

    ListProduct(keyword, null, nextPage, PAGE_SIZE)
      .then(res => {
        const data = res.data;
        setProducts(prev => [...prev, ...(data.content || []).map(mapProduct)]);
        setProductHasMore(!data.last);
      })
      .finally(() => { productLoadingRef.current = false; });
  }, [productPage, productHasMore, keyword]);

  // 게시물 무한스크롤
  const loadMorePosts = useCallback(() => {
    if (postLoadingRef.current || !postHasMore) return;
    const nextPage = postPage + 1;
    setPostPage(nextPage);
    postLoadingRef.current = true;

    SearchPost(keyword, nextPage, PAGE_SIZE)
      .then(res => {
        const data = res.data;
        setPosts(prev => [...prev, ...(data.content || []).map(mapPost)]);
        setPostHasMore(!data.last);
      })
      .finally(() => { postLoadingRef.current = false; });
  }, [postPage, postHasMore, keyword]);

  const productSentinelRef = useCallback(node => {
    if (productObserverRef.current) productObserverRef.current.disconnect();
    if (!node) return;
    productObserverRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMoreProducts();
    }, { threshold: 0.1 });
    productObserverRef.current.observe(node);
  }, [loadMoreProducts]);

  const postSentinelRef = useCallback(node => {
    if (postObserverRef.current) postObserverRef.current.disconnect();
    if (!node) return;
    postObserverRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMorePosts();
    }, { threshold: 0.1 });
    postObserverRef.current.observe(node);
  }, [loadMorePosts]);

  const handleLike = (postId) => {
    if (!user) { setShowAuthModal(true); return; }
    ToggleLike(postId)
      .then(res => {
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, liked: res.data.liked, likes: res.data.likeCount } : p
        ));
      })
      .catch(() => {});
  };

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuthModal(true)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {selectedPost && (
        <PostDetailPanel post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      <div className="search-page-header">
        <h1 className="search-page-title">"{keyword}" 검색 결과</h1>
      </div>

      {/* 탭 */}
      <div className="search-tabs">
        <button
          className={`search-tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          상품 {products.length > 0 && `(${products.length}+)`}
        </button>
        <button
          className={`search-tab ${activeTab === "styles" ? "active" : ""}`}
          onClick={() => setActiveTab("styles")}
        >
          스타일 {posts.length > 0 && `(${posts.length}+)`}
        </button>
      </div>

      {/* 상품 탭 */}
      {activeTab === "products" && (
        <>
          {productLoading && products.length === 0 ? (
            <div className="search-empty"><p>상품을 불러오는 중...</p></div>
          ) : products.length === 0 ? (
            <div className="search-empty"><p>"{keyword}"에 해당하는 상품이 없습니다.</p></div>
          ) : (
            <>
              <div className="shop-grid">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWished={wishlistedIds.includes(product.id)}
                  />
                ))}
              </div>
              {productHasMore && <div ref={productSentinelRef} style={{ height: '40px' }} />}
            </>
          )}
        </>
      )}

      {/* 스타일 탭 */}
      {activeTab === "styles" && (
        <>
          {postLoading && posts.length === 0 ? (
            <div className="search-empty"><p>스타일을 불러오는 중...</p></div>
          ) : posts.length === 0 ? (
            <div className="search-empty"><p>"{keyword}" 브랜드 상품이 태그된 스타일이 없습니다.</p></div>
          ) : (
            <>
              <div className="style-grid">
                {posts.map(card => (
                  <StyleCard
                    key={card.id}
                    card={card}
                    onClick={() => setSelectedPost(card)}
                    onLike={() => handleLike(card.id)}
                  />
                ))}
              </div>
              {postHasMore && <div ref={postSentinelRef} style={{ height: '40px' }} />}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default SearchPage;

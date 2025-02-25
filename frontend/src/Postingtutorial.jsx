import './css/howtopost.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, signOut, onAuthStateChanged } from './FirebaseService';
import { Slide, ToastContainer, toast } from 'react-toastify';

const JobPostingGuide = () => {
    const [activeQuestion, setActiveQuestion] = useState(null);
    const navigate = useNavigate();

    const addJob = () => {
        navigate('/addjob');
    }
    const [showSidebar, setShowSidebar] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const [user, setUser] = useState(null);
    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    const handleCloseSidebar = () => {
        setShowSidebar(false);
    };

    const deleteCookie = (name) => {
        document.cookie = `${name}=; Max-Age=0; path=/;`;
    };

    const logout = () => {
        signOut(auth)
            .then(() => {
                deleteCookie('idToken');
            })
            .catch((error) => {
                toast.error("هەڵەیەک ڕویدا" + error.message, { transition: Slide })
            });
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const response = await axios.post(
                        "http://localhost:3500/checkAuth",
                        { uid: firebaseUser.uid },
                        { withCredentials: true }
                    );
                    if (response.status === 200) {
                        setUser(firebaseUser);
                    } else if (response.status === 404) {
                        setUser(false);
                    } else {
                        setUser(false);
                    }
                } catch (error) {
                    setUser(false);
                }
            } else {
                setUser(false);
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div>
            <div className='nav'>
                <div className='container'>
                    <nav className='navigation' >
                        <div className='hamburger' onClick={toggleSidebar}>
                            <div className='bar'></div>
                            <div className='bar'></div>
                            <div className='bar'></div>
                        </div>
                        <div className='logodiv'>
                            <h2 className='logo'>Jobify</h2>
                        </div>
                        <ul className='nav-list'>
                            <li className='nav-item'><a href="/">پەیوەندی کردن</a></li>
                            <li className='nav-item'><a href="/jobs">دەربارە</a></li>
                            <li className='nav-item'><a href="/post">ئیشێک دابنێ</a></li>
                            <li className='nav-item'><a href="/CV">دروستکردنی سیڤی</a></li>
                            <li className='nav-item'><a href="/about">ئیشەکان</a></li>
                            <li className='nav-item'><a href="/contact">سەرەتا</a></li>
                        </ul>
                        <div className='account'>
                            {user ? (
                                <p onClick={toggleDropdown} className='accountName'> <i className="fa-solid fa-user"></i> {user.displayName.split(' ')[0]}</p>
                            ) : (
                                <p onClick={toggleDropdown} className='accountName'> <i className="fa-solid fa-user"></i> guest</p>
                            )}
                            <div className="user-dropdown">
                                <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                                    {user ? (
                                        <>
                                            <a href="#profile"><i className="fa-solid fa-gear"></i> پرۆفایل</a>
                                            <a href="#saves"><i className="fa-solid fa-bookmark"></i> لیستی دڵخوازەکان</a>
                                            <div className="logout">
                                                <a onClick={logout} href="#logout"><i className="fa-solid fa-right-from-bracket"></i> دەرچون</a>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <a href="/login"><i className="fa-solid fa-right-to-bracket"></i> چونەژورەوە</a>
                                            <a href="#profile"><i className="fa-solid fa-user-plus"></i> دروستکردنی هەژمار</a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={`sidebar-container ${showSidebar ? 'open' : ''}`}>
                            <div>
                                <i onClick={handleCloseSidebar} className={`fa-solid fa-x close ${showSidebar ? '' : 'open'}`}></i>
                            </div>
                            <ul className='nav-list-sidebar'>
                                <li className='nav-item-sidebar'><a href="/contact">سەرەتا</a></li>
                                <li className='nav-item-sidebar'><a href="/about">ئیشەکان</a></li>
                                <li className='nav-item-sidebar'><a href="/post">ئیشێک دابنێ</a></li>
                                <li className='nav-item-sidebar'><a href="/CV">دروستکردنی سیڤی</a></li>
                                <li className='nav-item-sidebar'><a href="/">پەیوەندی کردن</a></li>
                                <li className='nav-item-sidebar'><a href="/jobs">دەربارە</a></li>
                            </ul>
                        </div>
                    </nav>
                </div >
            </div >
            <div className="guide-container">
                <div className="hero">
                    <div className="hero-content">
                        <h1>چۆنیەتی بڵاوکردنەوەی هەلی کار</h1>
                        <p className="subtitle">ڕێنمایی هەنگاو بە هەنگاو بۆ بڵاوکردنەوەی کار</p>
                        <button onClick={addJob} className="start-button">
                            <span className="plus-icon">+</span>
                            زیادکردنی کار
                        </button>
                    </div>
                </div>

                <div className="steps-container">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <div className="step-icon">   <img className='vipandhelpjobs-img' src="create-account-icon.png" width={'50'} alt="" /></div>
                            <h2>دروستکردنی هەژمار</h2>
                            <p>سەرەتا پێویستە هەژمارێک دروست بکەیت وەک خاوەن کار:</p>
                            <ul className="requirements-list">
                                <li>
                                    <span className="check-icon">✓</span>
                                    کلیک لەسەر دروستکردنی هەژمار بکە
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    پڕکردنەوەی زانیاریەکان
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    هەڵبژاردنی ڕۆڵی خاوەن کار
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    کلیک لە درووستکردنی هەژمار بکە
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="step-card">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <div className="step-icon">📝</div>
                            <h2>تەواوکردنی پرۆفایل</h2>
                            <p>دڵنیابە لە هەبوونی هەژمار و ئیمەیڵەکەت دڵنیا کردبێتەوە:</p>
                            <ul className="requirements-list">
                                <li>
                                    <span className="check-icon">✓</span>
                                    ئیمەیڵی هەژمارەکەت دڵنیا بکەرەوە
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    پێویستە داخلی هەژمارەکەت بوبیت
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    برۆ بەشی کارێک دابنێ
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="step-card">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <div className="step-icon">📋</div>
                            <h2>زیادکردنی کار</h2>
                            <p>دوای تەواوکردنی پرۆفایل، دەتوانی کار زیاد بکەیت:</p>
                            <ul className="requirements-list">
                                <li>
                                    <span className="check-icon">✓</span>
                                    زانیاریە سەرەکیەکان پڕبکەوە
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    زانیاری ورد و تەواو لەسەر هەلی کارەکە بنووسە                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    دڵنیابەرەوە لە ڕاستی و درووستی زانیاریەکانت
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    پاشان کلیک لەسەر دانانی کار بکە
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="help-section">
                    <h2>پرسیارە باوەکان</h2>
                    <div className="faq-container">
                        {[
                            {
                                q: "چەند کاتژمێر دەخایەنێت تاکو کارەکەم بڵاو دەبێتەوە؟",
                                a: "دوای پێداچوونەوە لە ماوەی ٢٤ کاتژمێر بڵاو دەکرێتەوە بۆ ڕیگری کردن لە هەلی کاری ساختە"
                            },
                            {
                                q: "ئایا دەتوانم ڕیپۆرت لە هەلی کارێک بدەم؟",
                                a: 'بەڵێ دەتوانیت، ئەگەر هەستت کرد هەلی کارێک کێشەیەکی هەیە ئەوا دەتوانی ڕیپۆرتی بکەیت و هۆکارو تێبینی خۆت بنێریت'
                            },
                            {
                                q: 'نرخی بڵاوکردنەوەی هەلی کار چەندە؟',
                                a: 'بڵاوکردنەوەی هەلی کار بە خۆراییەو هیچ بڕە پارەیەک نادەیت تەنها پێویستت بە هەژمارێکە'
                            },
                        ].map((faq, index) => (
                            <div
                                key={index}
                                className={`faq-item ${activeQuestion === index ? 'active' : ''}`}
                                onClick={() => setActiveQuestion(activeQuestion === index ? null : index)}
                            >
                                <div className="question">
                                    <span>{faq.q}</span>
                                    <span className="arrow"><i class="fa-solid fa-angle-down"></i></span>
                                </div>
                                <div className="answer">{faq.a}</div>
                            </div>
                        ))}
                    </div>

                    <div className="contact-section">
                        <h2>پەیوەندیمان پێوە بکە</h2>
                        <div className="contact-grid">
                            <div className="contact-item">
                                <div className="contact-icon"><i class="fa-solid fa-envelope"></i></div>
                                <h3>ئیمەیڵ</h3>
                                <p>contact@example.com</p>
                            </div>
                            <div className="contact-item">
                                <div className="contact-icon"><i class="fa-solid fa-phone"></i></div>
                                <h3>تەلەفۆن</h3>
                                <p>0750 123 4567</p>
                            </div>
                        </div>

                        <div className="social-links">
                        <div className="social-icon">
                            <span><i class="fa-brands fa-facebook"></i></span> Facebook
                        </div>
                        <div className="social-icon">
                            <span><i class="fa-brands fa-instagram"></i></span> Instagram
                        </div>
                        <div className="social-icon">
                            <span><i class="fa-brands fa-telegram"></i></span> Telegram
                        </div>
                        <div className="social-icon">
                            <span><i class="fa-brands fa-tiktok"></i></span> TikTok
                        </div>
                        <div className="social-icon">
                            <span><i class="fa-brands fa-whatsapp"></i></span> Whatsapp
                        </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer className='footer-main'>
                <div className='footer-container'>
                    <div className='footer-main-div'>
                        <h2 className='footer-h2'>Jobify</h2>
                        <p className='footer-p1'>ماڵپەڕەکەمان پلاتفۆرمێکە کە دەتوانیت بە ئاسانی و بە خێرایی کار بدۆزیتەوە. هەروەها دەتوانیت کارەکەت لێرە بڵاو بکەیتەوە و باشترین کاندید بدۆزیتەوە بۆ کارەکەت.</p>
                        <div className='footer-main-social'>
                            <a className='socials' href="/"><i class="fa-brands fa-facebook"></i></a>
                            <a className='socials' href="/"><i class="fa-brands fa-tiktok"></i></a>
                            <a className='socials' href="/"><i class="fa-brands fa-instagram"></i></a>
                        </div>
                    </div>
                    <div className='footer-main-secs'>
                        <div className='footer-main-sec-links'>
                            <h3 className='footer-h3'>یارمەتی</h3>
                            <ul className='footer-ul'>
                                <li><a href="/">پرسیارە دووبارەکان</a></li>
                                <li><a href="/jobs">یارمەتی بەدەست بهێنە</a></li>
                                <li><a href="/jobs">پەیوەندیکردن</a></li>
                                <li><a href="/jobs">ڕێنمایی</a></li>
                                <li><a href="/jobs">ڕیکلام کردن</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className='footer-main-secs'>
                        <div className='footer-main-sec-links'>
                            <h3 className='footer-h3'>کارەکان</h3>
                            <ul className='footer-ul'>
                                <li><a href="/">بینینی ئیشەکان</a></li>
                                <li><a href="/jobs">ئیشی ڤی ئای پی</a></li>
                                <li><a href="/jobs">دۆزینەوەی هەلی کار</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className='footer-main-secs'>
                        <div className='footer-main-sec-links'>
                            <h3 className='footer-h3'>هەژمار</h3>
                            <ul className='footer-ul'>
                                <li><a href="/jobs">چونە ژوورەوە</a></li>
                                <li><a href="/">دروستکرندی هەژمار</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className='footer-bottom'>
                    <div className='footer-bottom-line'>
                    </div>
                    <div className='footer-bottom-txt'>
                        <p className='footer-bottom-p'>هەموو مافێک پارێزراوە بۆ جۆبی فای &copy; 2025</p>
                    </div>
                    <p className='powerby-p'>powered by <a className='powerby-a' target='_blank' rel="noreferrer" href="https://www.facebook.com/zhyaromer999/">zhyar omer</a></p>
                </div>
            </footer>
            <ToastContainer position="top-center" />
        </div>
    );
};

export default JobPostingGuide;
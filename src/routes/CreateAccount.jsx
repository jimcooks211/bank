import React, { useState, useEffect } from "react";
import 'react-phone-input-2/lib/high-res.css'; // make sure this is imported here OR in parent
import { ArrowDownIcon, ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import '../App.css'
import PhoneInput from 'react-phone-input-2';
import Account_Completion from "./Account_Completion";
import { data } from "react-router-dom";

const Spinner = ({ size = 50, width = 50, borderWidth = 2, color = "transparent" }) => {
  return (
    <div
      className="half-circle-spinner"
      style={{
        width: width,
        height: size,
        borderWidth: borderWidth,
        borderTopColor: color,
      }}
    />
  );
};

const CreateAccount = ({ onComplete, userData, dialCode, selectedCountry  }) => {
  const countryCode = selectedCountry?.toLowerCase() || 'us'; // fallback to Nigeria


  const [emailValue, setEmailValue] = useState(userData?.email || "");
  const [Error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitNumb, setsubmitNumb] = useState(() => {
  const saved = sessionStorage.getItem("submitNumb");
  return saved ? JSON.parse(saved) : false;
});
  const [phoneValue, setPhoneValue] = useState('')
  const [currentDialCode, setCurrentDialCode] = useState('')
  const [currentCountry, setCurrentCountry] = useState("")
  // State: store the FULL international value
const [fullPhone, setFullPhone] = useState("");
const [nextstep, setNextstep] = useState(() => {
  const saved = sessionStorage.getItem("nextstep");
  return saved ? JSON.parse(saved) : false;
});



  


  useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
  sessionStorage.setItem("submitNumb", JSON.stringify(submitNumb));
}, [submitNumb]);

    useEffect(() => {
  sessionStorage.setItem("nextstep", JSON.stringify(nextstep));
}, [nextstep]);


const isEmailValid = () => {
  const cleaned = emailValue.trim(); // remove leading/trailing spaces

  // 1. No spaces allowed anywhere
  if (/\s/.test(cleaned)) return false;

  // 2. Max length 25
  if (cleaned.length > 30) return false;

  // 3. Valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleaned);
};


const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");           // Clear any previous error
  setLoading(true);

  try {
    const response = await fetch('https://contests-complex-constitution-throws.trycloudflare.com/create-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: emailValue.trim(),
      }),
    });

    const data = await response.json(); // Safe to call even if not JSON (will throw)

    if (response.ok) {
      // Success → go to phone step
      setsubmitNumb(true);
      setError(""); // Clear success
    } else {
      // Handle specific backend errors
      if (response.status === 409) {
        setError(data.error || "This email is already registered. Please sign in.");
      } else if (response.status === 400) {
        setError(data.error || "Please enter a valid email address");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    }
  } catch (err) {
    // Network error, timeout, CORS, etc.
    console.error("Submit error:", err);
    setError("Network error – check your connection or if the server is running.");
  } finally {
    setLoading(false);
  }
};

  console.log("Sending phone to backend:", phoneValue);

const handleMobileSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  if (!phoneValue || phoneValue.length < 7) {
    setError("Please enter a valid mobile number");
    setLoading(false);
    return;
  }

  try {
    // Use fullPhone (which already has +prefix)
    const fullPhone = `+${currentDialCode}${phoneValue}`;

    const response = await fetch('https://contests-complex-constitution-throws.trycloudflare.com/add-mobile-number', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phone: fullPhone }),  // ← send full number
    });

    const data = await response.json();

    if (response.ok) {
      setshowCompletion(true);
    } else {
      setError(data.error || "Failed to add mobile number");
    }
  } catch (err) {
    setError("Network error – is the server running?");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

function CloseCompletion() {
  setNextstep(false);
}

  return (
    <>
    {loading && <div className="spinnerparent"><Spinner /></div>}
    {nextstep ? <Account_Completion CloseCompletion={CloseCompletion} /> : (
      <>
      <div className={`Create-Account ${submitNumb ? "nextstep" : ""}`}>
        <div className={`header-row`}>
<div>
<ArrowLeftIcon
              className="h-5 w-5 text-gray-700"
              strokeWidth={1.25}
              aria-hidden="true"
              onClick={() => {
                if (submitNumb) {
                  setsubmitNumb(false); // go back to email step
                } else {
                  onComplete();
                }
              }}
            />
</div>
          <div>
            <img
                src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
                alt={`${countryCode.toUpperCase()} flag`}
                style={{
                    width: '30px',
                    height: '21px',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
                />
            <div style={{width: "1.5rem"}}>
                <ChevronDownIcon 
            className="h-5 w-5 text-gray-700"
  strokeWidth={1.25}
  aria-hidden="true"/>
            </div>
          </div>
        </div>
            <div>
            <div></div>
            <p>Sign up for PayPal</p>
            <form action="/Create-Account" method="POST">
  <div className={`floating-group relative mb-6`}>
{submitNumb ? "" : 
<>
    <input
      type="text"
      id="username"
      placeholder=" "
      style={{
        border: Error ? "1px solid red" : "",
      }}
      className={Error ? "ErrorTilt" : ""}
      value={emailValue} 
      maxLength={30}
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
    <label htmlFor="username" style={{
        transform: emailValue ? "translate(15px, -58px)" : "",
        fontSize: emailValue ? "11px" : "",
        color: Error ? "red" : ""
    }}>
       {Error ? Error : "Enter your email"}
    </label></>
}
  </div>

{submitNumb ? (
    <button 
    onClick={handleMobileSubmit}
    type="submit"
    className="Email_Submit_Btn"
  >
    Next
  </button>
) : (
    <button 
    disabled={!isEmailValid()}
    onClick={handleSubmit}
    type="submit"
    className="Email_Submit_Btn"
  >
    Next
  </button>
)}
</form>
        </div>
      </div>
      {submitNumb && (
            <div className="yournumber">
        <form onSubmit={handleMobileSubmit} action="/add-mobile-number" method="POST">
          <PhoneInput
    country={selectedCountry}
value={fullPhone}  // ← library manages the full value
  onChange={(value, countryData) => {

    setFullPhone(value); // ← accept whatever the library gives
    setPhoneValue(value.slice(1))

    // Optional: update country/dial code only on real change
    if (countryData?.countryCode && countryData.countryCode !== currentCountry) {
      setCurrentCountry(countryData.countryCode);
      setCurrentDialCode(countryData.dialCode);
    }
  }}
    inputStyle={{ display: '', width: "100%", background: "white", padding: "15px 20px 0", height: "4.3rem", borderRadius: "12px", fontSize: "11px", WebkitTextStroke: "0.02em", boxSizing: "border-box", fontFamily: "Arial, Helvetica, sans-serif" }}
    buttonStyle={{
      border: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      display: "none",
    }}
    className="SIGN_Numb"
    placeholder="000-000-0000"
  />
  <label htmlFor="mobilenumber" className="mobilenumber">Mobile number</label>
        </form>
      </div>
        )}
        </>
    )}
    </>
  );
};

export default CreateAccount;
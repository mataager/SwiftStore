/**
 * Checks store status before loading the page.
 * @param {string} uid - The Firebase user/store ID.
 */

async function checkSiteStatus(uid) {
  if (!uid) {
    blockPageAccess({
      title: "Access Denied",
      message: "Invalid store access. Contact the owner for assistance.",
      reason: "No UID provided",
      contactNumber: null,
    });
    return false;
  }

  try {
    const response = await fetch(
      `https://matager-f1f00-default-rtdb.firebaseio.com/Stores/${uid}/store-info.json`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch store info.");
    }

    const data = await response.json();

    if (!data) {
      blockPageAccess({
        title: "Store Not Found",
        message: "This store doesn't exist. Contact the owner for assistance.",
        reason: "Store data not found in database",
        contactNumber: null,
      });
      return false;
    }

    const status = data.status?.toLowerCase();
    const endingDateStr = data["ending-date"];
    const contactNumber = data["phone-number"] || null;

    // Check status first
    if (status === "pending") {
      blockPageAccess({
        title: "Store Pending For A While",
        message:
          "This store is pending right now. Contact the owner for more information.",
        reason: `Status: ${status}`,
        endingDate: endingDateStr,
        contactNumber: contactNumber,
      });
      return false;
    }

    if (status === "stopped") {
      blockPageAccess({
        title: "Store Suspended",
        message:
          "This store has been suspended. Contact the owner to resolve the issue.",
        reason: `Status: ${status}`,
        endingDate: endingDateStr,
        contactNumber: contactNumber,
      });
      return false;
    }
    if (status === "commingsoon") {
      blockPageAccess({
        title: "Coming Soon!", // Updated title
        message: "We're working hard to launch this store. Check back later!",
        reason: `Status: ${status}`,
        // endingDate: endingDateStr,
        contactNumber: contactNumber,
      });
      return false;
    }

    // Then check expiry date if status is active
    if (endingDateStr) {
      // Parse the date string in format "DD/MM/YYYY, HH:MM:SS am/pm"
      const dateTimeParts = endingDateStr.split(", ");
      if (dateTimeParts.length !== 2) {
        console.error("Invalid date format - missing time part");
        return true; // Don't block if we can't parse the date
      }

      const [datePart, timePart] = dateTimeParts;
      const [day, month, year] = datePart.split("/").map(Number);
      const [time, period] = timePart.split(" ");
      const [hours, minutes, seconds] = time.split(":").map(Number);

      // Convert to 24-hour format
      let hours24 = hours;
      if (period.toLowerCase() === "pm" && hours < 12) {
        hours24 += 12;
      } else if (period.toLowerCase() === "am" && hours === 12) {
        hours24 = 0;
      }

      // Create date object (months are 0-indexed)
      const endingDate = new Date(
        year,
        month - 1,
        day,
        hours24,
        minutes,
        seconds
      );

      const now = new Date();

      if (isNaN(endingDate.getTime())) {
        console.error("Invalid ending-date format:", endingDateStr);
      } else if (endingDate < now) {
        // Clear the body content first
        document.body.innerHTML = "";
        blockPageAccess({
          title: "Subscription Expired",
          message:
            "This store's subscription has ended. Contact the owner to renew.",
          reason: `Subscription ended on ${endingDateStr}`,
          endingDate: endingDateStr,
          contactNumber: contactNumber,
        });
        return false;
      }
    }

    return true; // Return true if access should be allowed
  } catch (error) {
    console.error("Error checking site status:", error);

    const isNetworkError =
      !navigator.onLine || error.message.includes("Network");

    blockPageAccess({
      title: "Verification Failed",
      message: isNetworkError
        ? "Network issue detected. Please check your internet connection and try again."
        : "Unable to verify store status. Please try again later.",
      reason: error.message,
      contactNumber: null,
    });

    return false;
  }
  
}

function blockPageAccess({
  title,
  message,
  reason,
  endingDate,
  contactNumber,
}) {
  document.documentElement.innerHTML = `
    <!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@100;200;300&display=swap');
      
      /* Ultra-thin scrollbar styling */
      ::-webkit-scrollbar {
        width: 1px; /* Makes the scrollbar super thin */
      }
      
      ::-webkit-scrollbar-track {
        background: transparent; /* Makes track invisible */
      }
      
     

      body {
        background: linear-gradient(135deg, #f9f9f9 0%, #f0f5ff 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        font-family: 'Josefin Sans', sans-serif;
        overflow-y: scroll;
      }
      
      .message {
        text-align: center;
        padding: 40px;
        max-width: 600px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 24px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        transform-style: preserve-3d;
        transform: perspective(1000px);
        position: relative;
        overflow: hidden;
        margin: 20px;
      }
      
      .message::before {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(208,227,255,0.1) 0%, rgba(208,227,255,0) 70%);
        animation: float 12s infinite linear;
        z-index: -1;
      }
      
      .message::after {
        content: "";
        position: absolute;
        bottom: -30%;
        right: -30%;
        width: 60%;
        height: 60%;
        background: radial-gradient(circle, rgba(255,230,208,0.1) 0%, rgba(255,230,208,0) 70%);
        animation: floatReverse 8s infinite linear;
        z-index: -1;
      }
      
      @keyframes float {
        0% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(-5%, 5%) rotate(2deg); }
        50% { transform: translate(-10%, 0) rotate(0deg); }
        75% { transform: translate(-5%, -5%) rotate(-2deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
      }
      
      @keyframes floatReverse {
        0% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(5%, -5%) rotate(-2deg); }
        50% { transform: translate(10%, 0) rotate(0deg); }
        75% { transform: translate(5%, 5%) rotate(2deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
      }
      
      .message h1 {
        font-weight: 100;
        font-size: 3.5rem;
        letter-spacing: -0.05em;
        margin: 0 0 20px 0;
        color: #222;
        text-shadow: 0 2px 4px rgba(0,0,0,0.03);
        position: relative;
        display: inline-block;
      }
      
      .message h1::after {
        content: "";
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(90deg, transparent 0%, rgba(208,227,255,0.8) 50%, transparent 100%);
      }
      
      .message p {
        font-weight: 200;
        font-size: 1.1rem;
        line-height: 1.6;
        color: #444;
        margin: 0 0 20px 0;
      }
      
      .contact-box {
        margin-top: 30px;
        padding: 25px;
        background: linear-gradient(135deg, rgba(240,248,255,0.8) 0%, rgba(230,240,255,0.8) 100%);
        border-radius: 16px;
        border: 1px solid rgba(208,227,255,0.5);
        box-shadow: inset 0 1px 3px rgba(255,255,255,0.5), 0 4px 12px rgba(208,227,255,0.3);
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .contact-box:hover {
        transform: translateY(-2px);
        box-shadow: inset 0 1px 3px rgba(255,255,255,0.5), 0 6px 16px rgba(208,227,255,0.4);
      }
      
      .contact-box::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%);
        pointer-events: none;
      }
      
      .contact-box p {
        font-weight: 300;
        color: #333;
        margin-bottom: 15px;
      }
      
      .contact-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: 10px;
        padding: 12px 24px;
        background: linear-gradient(135deg, rgba(208,227,255,0.8) 0%, rgba(180,210,255,0.8) 100%);
        border: 1px solid rgba(208,227,255,0.8);
        color: #272727;
        text-decoration: none;
        border-radius: 50px;
        font-weight: 300;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(208,227,255,0.3);
        position: relative;
        overflow: hidden;
      }
      
      .contact-button::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        transition: all 0.5s ease;
      }
      
      .contact-button:hover {
        border: 1px solid rgba(39,39,39,0.2);
        box-shadow: 0 4px 12px rgba(208,227,255,0.5);
        transform: translateY(-1px);
      }
      
      .contact-button:hover::before {
        left: 100%;
      }
      
      .reason-container {
        margin-top: 30px;
        padding: 20px;
        background: rgba(255,255,255,0.7);
        border-radius: 12px;
        border: 1px solid rgba(0,0,0,0.05);
      }
      
      .reason-container strong {
        font-weight: 300;
        color: #555;
        display: block;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
      }
      
      .reason-text {
        font-weight: 200;
        color: #666;
        font-size: 0.95rem;
        line-height: 1.5;
      }
      
      .ending-date {
        font-weight: 200;
        color: #555;
        margin: 20px 0;
        padding: 12px;
        background: rgba(255,245,240,0.6);
        border-radius: 8px;
        display: inline-block;
      }
      
      .ending-date strong {
        font-weight: 300;
      }
      
      /* Floating particles */
      .particle {
        position: absolute;
        background: rgba(208,227,255,0.3);
        border-radius: 50%;
        pointer-events: none;
        z-index: -1;
      }
      
      /* Create particles */
      body::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        background-image: 
          radial-gradient(circle at 20% 30%, rgba(208,227,255,0.1) 0%, transparent 2%),
          radial-gradient(circle at 80% 70%, rgba(255,230,208,0.1) 0%, transparent 2%),
          radial-gradient(circle at 40% 60%, rgba(208,255,227,0.1) 0%, transparent 2%),
          radial-gradient(circle at 60% 20%, rgba(227,208,255,0.1) 0%, transparent 2%);
        background-size: 300px 300px;
        animation: particleMove 60s infinite linear;
      }
      
      @keyframes particleMove {
        0% { transform: translate(0, 0); }
        100% { transform: translate(-150px, -150px); }
      }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@100;200;300&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  </head>
  <body>
    <div class="message">
      <h1>${title}</h1>
      <p>${message}</p>
      ${
        endingDate
          ? `<div class="ending-date"><strong>Ending Date:</strong> ${endingDate}</div>`
          : ""
      }
      
      ${
        contactNumber
          ? `
        <div class="contact-box">
          <p><strong>Contact Store Owner</strong></p>
          <a href="tel:${contactNumber}" class="contact-button">
            <i class="bi bi-telephone" style="margin-right: 8px;"></i>
            Call ${formatPhoneNumber(contactNumber)}
          </a>
        </div>
      `
          : ""
      }
      
      <div class="reason-container">
        <strong>Reason</strong>
        <div class="reason-text">${reason}</div>
      </div>
    </div>
    
    <script>
      // Create floating particles
      document.addEventListener('DOMContentLoaded', function() {
        const colors = ['rgba(208,227,255,0.3)', 'rgba(255,230,208,0.3)', 'rgba(208,255,227,0.3)', 'rgba(227,208,255,0.3)'];
        
        for (let i = 0; i < 20; i++) {
          const particle = document.createElement('div');
          particle.classList.add('particle');
          
          const size = Math.random() * 10 + 5;
          particle.style.width = size + 'px';
          particle.style.height = size + 'px';
          
          particle.style.left = Math.random() * 100 + 'vw';
          particle.style.top = Math.random() * 100 + 'vh';
          particle.style.background = colors[Math.floor(Math.random() * colors.length)];
          
          document.body.appendChild(particle);
          
          // Animate particles
          animateParticle(particle);
        }
      });
      
      function animateParticle(particle) {
        let x = parseFloat(particle.style.left);
        let y = parseFloat(particle.style.top);
        let xSpeed = (Math.random() - 0.5) * 0.2;
        let ySpeed = (Math.random() - 0.5) * 0.2;
        
        function move() {
          x += xSpeed;
          y += ySpeed;
          
          // Bounce off edges
          if (x < 0 || x > 100) xSpeed *= -1;
          if (y < 0 || y > 100) ySpeed *= -1;
          
          particle.style.left = x + 'vw';
          particle.style.top = y + 'vh';
          
          requestAnimationFrame(move);
        }
        
        move();
      }
    </script>
  </body>
</html>
  `;
}

// Helper function to format phone numbers
function formatPhoneNumber(phoneNumber) {
  // Implement your phone number formatting logic here
  return phoneNumber; // Return formatted number
}
/**
 * Formats phone numbers for better display
 */
function formatPhoneNumber(phoneNumber) {
  // Egyptian phone number format
  if (phoneNumber.startsWith("01") && phoneNumber.length === 11) {
    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(
      3,
      7
    )} ${phoneNumber.slice(7)}`;
  }
  return phoneNumber;
}

checkSiteStatus(uid);

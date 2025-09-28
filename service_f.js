document.addEventListener("scroll", function () {
    const sections = document.querySelectorAll(".service-section");
    const scrollPosition = window.scrollY;
  
    sections.forEach((section, index) => {
      const sectionOffset = section.offsetTop;
      const sectionHeight = section.clientHeight;
  
      // Determine when to activate the next section and change images
      if (scrollPosition >= sectionOffset - window.innerHeight * 0.6 && scrollPosition < sectionOffset + sectionHeight) {
        // Add active class to make the current section "active"
        section.classList.add("active");
  
        // Set the image of the active section to be visible, others to be hidden
        const images = document.querySelectorAll('.image img');
        images.forEach((img, idx) => {
          img.style.opacity = (idx === index) ? '1' : '0';
        });
  
      } else {
        section.classList.remove("active");
      }
    });
  
    // Scroll behavior for text (make text scroll up)
    sections.forEach((section) => {
      const text = section.querySelector(".text");
      const offset = section.offsetTop;
  
      if (scrollPosition > offset) {
        const translateY = (scrollPosition - offset) * 0.3; // Adjust scroll speed
        text.style.transform = `translateY(-${translateY}px)`;
      } else {
        text.style.transform = "translateY(0)";
      }
    });
  });
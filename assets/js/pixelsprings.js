/**
 * Pixelsprings Editorial Theme JavaScript Engine
 * Handles 3D Hero Carousel, Mobile Navigation, FAQ Accordions, Lightbox Modal, and Contact Form
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    // --- 1. Hero Carousel 3D Perspective Animation ---
    var marquee = document.querySelector('.hero-marquee');
    if (marquee) {
      var tiles = Array.from(marquee.querySelectorAll('.hero-tile'));
      var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      var mobileViewport = window.matchMedia('(max-width: 680px)');
      var frameId = 0;
      var isVisible = false;

      var updatePerspective = function () {
        frameId = 0;
        var rect = marquee.getBoundingClientRect();
        var center = rect.left + rect.width / 2;
        var halfWidth = Math.max(rect.width / 2, 1);
        var minimumScale = mobileViewport.matches ? 0.9 : 0.79;
        var rotationLimit = mobileViewport.matches ? 3 : 9;

        tiles.forEach(function (tile) {
          var bounds = tile.getBoundingClientRect();
          var position = Math.max(-1, Math.min(1, (bounds.left + bounds.width / 2 - center) / halfWidth));
          var scale = minimumScale + (1 - minimumScale) * Math.abs(position);
          tile.style.setProperty('--carousel-scale', scale.toFixed(3));
          tile.style.setProperty('--carousel-rotation', (-position * rotationLimit).toFixed(2) + 'deg');
        });

        if (isVisible && !reducedMotion.matches) {
          frameId = window.requestAnimationFrame(updatePerspective);
        }
      };

      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          var entry = entries[0];
          isVisible = Boolean(entry && entry.isIntersecting);
          if (isVisible) {
            if (frameId) window.cancelAnimationFrame(frameId);
            updatePerspective();
          } else if (frameId) {
            window.cancelAnimationFrame(frameId);
            frameId = 0;
          }
        });
        observer.observe(marquee);
      } else {
        isVisible = true;
        updatePerspective();
      }

      window.addEventListener('resize', function () {
        if (!isVisible) return;
        if (frameId) window.cancelAnimationFrame(frameId);
        updatePerspective();
      }, { passive: true });
    }

    // --- 2. Mobile Navigation Drawer ---
    var menuBtn = document.getElementById('mobileMenuToggle');
    var mobileNav = document.getElementById('mobile-navigation');
    if (menuBtn && mobileNav) {
      menuBtn.addEventListener('click', function () {
        var isOpen = mobileNav.style.display !== 'none';
        mobileNav.style.display = isOpen ? 'none' : 'flex';
        menuBtn.textContent = isOpen ? '☰' : '×';
        menuBtn.setAttribute('aria-expanded', !isOpen);
      });
      mobileNav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileNav.style.display = 'none';
          menuBtn.textContent = '☰';
          menuBtn.setAttribute('aria-expanded', 'false');
        });
      });
      window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobileNav.style.display !== 'none') {
          mobileNav.style.display = 'none';
          menuBtn.textContent = '☰';
          menuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // --- 3. Accessible FAQ Accordions ---
    var faqButtons = document.querySelectorAll('.faq-question');
    faqButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var isExpanded = btn.getAttribute('aria-expanded') === 'true';
        var answerId = btn.getAttribute('aria-controls');
        var answer = document.getElementById(answerId);

        // Close other FAQs in the same container for clean editorial flow
        var parentList = btn.closest('.faq-list');
        if (parentList) {
          parentList.querySelectorAll('.faq-question').forEach(function (otherBtn) {
            if (otherBtn !== btn) {
              otherBtn.setAttribute('aria-expanded', 'false');
              var otherAnswer = document.getElementById(otherBtn.getAttribute('aria-controls'));
              if (otherAnswer) {
                otherAnswer.classList.remove('open');
                otherAnswer.setAttribute('aria-hidden', 'true');
              }
            }
          });
        }

        // Toggle target
        if (isExpanded) {
          btn.setAttribute('aria-expanded', 'false');
          if (answer) {
            answer.classList.remove('open');
            answer.setAttribute('aria-hidden', 'true');
          }
        } else {
          btn.setAttribute('aria-expanded', 'true');
          if (answer) {
            answer.classList.add('open');
            answer.setAttribute('aria-hidden', 'false');
          }
        }
      });
    });

    // --- 4. Portfolio Lightbox Modal ---
    var lightbox = document.getElementById('projectLightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxClose = document.getElementById('lightboxClose');
    var lightboxPrev = document.getElementById('lightboxPrev');
    var lightboxNext = document.getElementById('lightboxNext');
    var projectButtons = document.querySelectorAll('.project');

    var projectData = [];
    projectButtons.forEach(function (btn) {
      var img = btn.querySelector('img');
      projectData.push({
        src: img ? img.getAttribute('src') : '',
        alt: img ? img.getAttribute('alt') : ''
      });
    });

    var currentIndex = 0;

    function openLightbox(index) {
      if (!projectData.length) return;
      currentIndex = (index + projectData.length) % projectData.length;
      if (lightboxImg) {
        lightboxImg.src = projectData[currentIndex].src;
        lightboxImg.alt = projectData[currentIndex].alt;
      }
      if (lightbox) {
        lightbox.style.display = 'grid';
        document.body.style.overflow = 'hidden';
        if (lightboxClose) lightboxClose.focus();
      }
    }

    function closeLightbox() {
      if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
      }
    }

    projectButtons.forEach(function (btn, idx) {
      btn.addEventListener('click', function () {
        openLightbox(idx);
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', function (e) { e.stopPropagation(); openLightbox(currentIndex - 1); });
    if (lightboxNext) lightboxNext.addEventListener('click', function (e) { e.stopPropagation(); openLightbox(currentIndex + 1); });

    if (lightbox) {
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
      });
    }

    window.addEventListener('keydown', function (e) {
      if (lightbox && lightbox.style.display === 'grid') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
        if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
      }
    });

    // --- 5. Interactive Contact Form with Local Storage & Mailto Dispatch ---
    var forms = document.querySelectorAll('.contact-form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var formData = new FormData(form);
        var name = (formData.get('name') || '').toString().trim();
        var email = (formData.get('email') || '').toString().trim();
        var company = (formData.get('company') || '').toString().trim();
        var service = (formData.get('service') || '').toString().trim();
        var message = (formData.get('message') || '').toString().trim();

        var submission = {
          name: name,
          email: email,
          company: company || 'Not provided',
          service: service || 'Not specified',
          message: message,
          timestamp: new Date().toISOString()
        };

        try {
          var submissions = JSON.parse(localStorage.getItem('pixelsprings_submissions') || '[]');
          submissions.push(submission);
          localStorage.setItem('pixelsprings_submissions', JSON.stringify(submissions));
        } catch (err) {}

        // Toast feedback
        var toastContainer = document.getElementById('toastContainer');
        if (toastContainer) {
          var toast = document.createElement('div');
          toast.className = 'toast';
          toast.innerHTML = '<span class="toast-icon">✓</span><div class="toast-content"><h4>Opening Mail Draft...</h4><p>Preparing direct message to contact@pixelsprings.com</p></div>';
          toastContainer.appendChild(toast);
          setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(function () { toast.remove(); }, 300);
          }, 4000);
        }

        var subject = encodeURIComponent('A question for Pixelsprings from ' + name);
        var body = encodeURIComponent(
          'Name: ' + name + '\n' +
          'Email: ' + email + '\n' +
          'Company / Website: ' + (company || 'Not provided') + '\n' +
          'Area: ' + (service || 'Not specified') + '\n\n' +
          message
        );

        setTimeout(function () {
          window.location.href = 'mailto:contact@pixelsprings.com?subject=' + subject + '&body=' + body;
        }, 500);
      });
    });

  });
})();

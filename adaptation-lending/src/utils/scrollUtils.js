/**
 * Smoothly scrolls to a specific section by ID
 * @param {string} id - The ID of the element to scroll to
 */
export const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}; 
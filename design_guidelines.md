# College Admission Management System - Design Guidelines

## Design Approach: Material Design System

**Rationale:** Educational institutions require trust, professionalism, and consistency. Material Design provides robust patterns for data-heavy applications with forms, tables, and dashboards while maintaining accessibility standards critical for educational systems.

## Typography Hierarchy

**Font Family:** Roboto (Material Design standard)
- Display headings: Roboto Medium, 32px/40px
- Page titles: Roboto Regular, 24px/32px  
- Section headers: Roboto Medium, 20px/28px
- Body text: Roboto Regular, 16px/24px
- Form labels: Roboto Medium, 14px/20px
- Helper text: Roboto Regular, 12px/16px
- Button text: Roboto Medium, 14px (uppercase)

## Layout System

**Spacing:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 for consistency
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-16
- Card internal spacing: p-6
- Form field spacing: gap-6
- Dashboard grid gaps: gap-4 to gap-6

**Container Strategy:**
- Public pages: max-w-7xl centered
- Dashboard layouts: Full-width with max-w-screen-2xl
- Form containers: max-w-3xl
- Content sections: max-w-6xl

## Public Pages Layout

### Home Page
**Hero Section (60vh):**
- Large hero image: Modern campus scene or students collaborating
- Overlay with frosted glass effect (backdrop-blur-md) containing headline and CTA
- Primary CTA button with blurred background over hero image
- No hover/active states for hero buttons (use default Material button states)

**Structure (6-7 sections):**
1. Hero with admission deadlines banner
2. Key Features grid (3 columns): "Easy Application", "Track Status", "Quick Approval" with icons
3. Admission Process timeline (4 steps horizontal)
4. Available Programs showcase (2-column grid with program cards)
5. Statistics section (4 columns): "Students Enrolled", "Courses Offered", "Success Rate", "Years Experience"
6. Testimonials (2-column cards with student photos)
7. CTA section with "Apply Now" and "Contact Admissions"

### Other Public Pages
- About: Single column, max-w-4xl, include institution image, mission statement, accreditation badges
- Contact: 2-column layout (contact form + contact information with office hours)
- Courses: Responsive grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) with course cards

## Dashboard Layouts (Student & Admin)

**Structure:**
- Fixed sidebar (240px width) with navigation menu
- Top toolbar (64px height) with breadcrumbs, notifications icon, profile menu
- Main content area with responsive padding (p-6 to p-8)

**Student Dashboard:**
- Application status card (prominent, top position)
- Quick actions grid (2x2 on desktop, single column mobile)
- Recent notifications list
- Profile completion progress indicator

**Admin Dashboard:**
- Stats cards row (4 columns on desktop: Total, Pending, Approved, Rejected)
- Chart section (full-width bar/line chart showing applications over time)
- Recent applications table below
- Quick action buttons for common tasks

## Component Specifications

### Cards (MatCard)
- Consistent shadow: elevation-2
- Rounded corners: rounded-lg
- Internal padding: p-6
- Header with icon + title combination
- Divider between header and content when appropriate

### Forms
- Full-width form fields with consistent spacing (gap-6)
- Multi-step forms: Stepper component for admission form
- Field grouping: Related fields in MatCard containers
- Validation: Real-time inline error messages below fields
- File upload: Drag-and-drop zone with preview thumbnails

### Tables (MatTable)
- Sticky header for long lists
- Pagination: 10/25/50 items per page
- Search bar positioned top-right
- Filter chips below search
- Action column with icon buttons (view, edit, delete)
- Alternating row treatment for readability

### Navigation
- Sidebar: Fixed, collapsible on mobile (hamburger menu)
- Active state: Accent border and background tint
- Icons aligned left with text labels
- Grouped menu items with subheaders

### Buttons
- Primary actions: Raised buttons with default Material hover states
- Secondary actions: Outlined buttons
- Tertiary actions: Text buttons
- Icon buttons for compact spaces (tables, toolbars)
- Full-width buttons on mobile for primary CTAs

## Responsive Breakpoints

- Mobile: < 768px (single column, stacked navigation)
- Tablet: 768px - 1024px (2-column grids, sidebar overlay)
- Desktop: > 1024px (full multi-column layouts, permanent sidebar)

## Images Strategy

**Required Images:**
- Home hero: Wide campus/students image (1920x800px minimum)
- About page: Institution building or campus life (1200x600px)
- Testimonial photos: Student headshots (200x200px, circular)
- Course cards: Representative images for each program type

## Animations

**Minimal, purposeful motion:**
- Page transitions: 200ms ease
- Card hover: Subtle elevation change (150ms)
- Form validation: Shake animation for errors
- Loading states: Material spinner for async operations
- No scroll animations or parallax effects

## Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support throughout
- Proper ARIA labels on interactive elements
- Focus indicators visible on all interactive components
- Form error announcements for screen readers
- Sufficient touch target sizes (minimum 44x44px)
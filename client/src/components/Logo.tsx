import skullLogo from "../assets/title_logo.webp";


export function Logo() {
  return (
    <img
          src={skullLogo}
          alt="Skull Logo"
          className="title-page__main-logo"
    />
  );
}
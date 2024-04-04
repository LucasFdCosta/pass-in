import nlwUniteIcon from "../assets/nlw-unite-icon.svg"


interface HeaderProps {
  
}

export function Header({}: HeaderProps) {
  return (
    <div className="flex items-center gap-5 py-2">
      <img src={nlwUniteIcon} />

      <nav className="flex gap-2">
        <a href="" className="font-medium text-sm text-zinc-300">Events</a>
        <a href="" className="font-medium text-sm">Attendee</a>
      </nav>
    </div>
  )
}
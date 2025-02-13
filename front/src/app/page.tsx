import { redirect } from 'next/navigation'
import '../styles/globals.css'

export default function Home() {
  redirect('/Login')
}

import React from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import ShowcaseCard from '../components/ui/ShowcaseCard.jsx'

const LoginPage = () => {
  const navigate = useNavigate()

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg">
        <ShowcaseCard className="border-t-4 border-t-cyan-500/50">
          <LoginForm onLogin={() => navigate('/dashboard')} />
        </ShowcaseCard>

        <div className="mt-6 text-center text-xs text-gray-500 tracking-wider">
          Login or enter a name to start as Guest
        </div>
      </div>
    </div>
  )
}

export default LoginPage

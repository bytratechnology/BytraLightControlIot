import { useState, useEffect, useRef } from 'react'
import { ref, onValue, set, push } from 'firebase/database'
import { database } from './firebase'

function App() {
  const [lightStatus, setLightStatus] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [scheduleTime, setScheduleTime] = useState('')
  const [scheduleAction, setScheduleAction] = useState('on')
  const [schedules, setSchedules] = useState([])
  const [history, setHistory] = useState([])
  const lastMinuteRef = useRef(-1)

  // Lắng nghe thay đổi từ Firebase
  useEffect(() => {
    const lightRef = ref(database, 'light/status')
    const historyRef = ref(database, 'light/history')
    const schedulesRef = ref(database, 'light/schedules')
    
    const unsubscribeStatus = onValue(lightRef, (snapshot) => {
      const status = snapshot.val()
      setLightStatus(status === true)
      setLoading(false)
    })

    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const historyArray = Object.values(data).sort((a, b) => b.timestamp - a.timestamp)
        setHistory(historyArray.slice(0, 10)) // Lấy 10 bản ghi gần nhất
      } else {
        setHistory([])
      }
    })

    const unsubscribeSchedules = onValue(schedulesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const schedulesArray = Object.entries(data).map(([id, schedule]) => ({
          id,
          ...schedule
        }))
        setSchedules(schedulesArray)
      } else {
        setSchedules([])
      }
    })

    return () => {
      unsubscribeStatus()
      unsubscribeHistory()
      unsubscribeSchedules()
    }
  }, [])

  // Cập nhật thời gian và kiểm tra hẹn giờ mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      
      const currentMinute = now.getMinutes()
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
      
      // Reset executed khi phút thay đổi (để hẹn giờ có thể chạy lại mỗi ngày)
      if (currentMinute !== lastMinuteRef.current) {
        schedules.forEach(async (schedule) => {
          if (schedule.executed && schedule.time !== currentTimeStr) {
            const resetRef = ref(database, `light/schedules/${schedule.id}/executed`)
            await set(resetRef, false)
          }
        })
        lastMinuteRef.current = currentMinute
      }
      
      // Kiểm tra và thực thi hẹn giờ
      schedules.forEach(async (schedule) => {
        if (!schedule.enabled || schedule.executed) return
        
        if (schedule.time === currentTimeStr) {
          await executeSchedule(schedule.id, schedule.action)
        }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [schedules])

  // Thực thi hẹn giờ
  const executeSchedule = async (scheduleId, action) => {
    try {
      const newStatus = action === 'on'
      const lightRef = ref(database, 'light/status')
      await set(lightRef, newStatus)
      setLightStatus(newStatus)
      
      // Đánh dấu đã thực thi
      const scheduleRef = ref(database, `light/schedules/${scheduleId}/executed`)
      await set(scheduleRef, true)
      
      // Thêm vào lịch sử
      await addToHistory(action === 'on' ? 'BẬT' : 'TẮT', 'Hẹn giờ')
    } catch (error) {
      console.error('Lỗi khi thực thi hẹn giờ:', error)
    }
  }

  // Thêm vào lịch sử
  const addToHistory = async (action, type = 'Thủ công') => {
    try {
      const historyRef = ref(database, 'light/history')
      await push(historyRef, {
        action,
        type,
        timestamp: Date.now(),
        time: currentTime.toLocaleString('vi-VN')
      })
    } catch (error) {
      console.error('Lỗi khi thêm lịch sử:', error)
    }
  }

  const toggleLight = async () => {
    try {
      const lightRef = ref(database, 'light/status')
      const newStatus = !lightStatus
      await set(lightRef, newStatus)
      setLightStatus(newStatus)
      await addToHistory(newStatus ? 'BẬT' : 'TẮT', 'Thủ công')
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đèn:', error)
      alert('Có lỗi xảy ra khi cập nhật trạng thái đèn')
    }
  }

  const addSchedule = async () => {
    if (!scheduleTime) {
      alert('Vui lòng chọn thời gian')
      return
    }

    try {
      const schedulesRef = ref(database, 'light/schedules')
      await push(schedulesRef, {
        time: scheduleTime,
        action: scheduleAction,
        enabled: true,
        executed: false
      })
      setScheduleTime('')
      setScheduleAction('on')
    } catch (error) {
      console.error('Lỗi khi thêm hẹn giờ:', error)
      alert('Có lỗi xảy ra khi thêm hẹn giờ')
    }
  }

  const deleteSchedule = async (scheduleId) => {
    try {
      const scheduleRef = ref(database, `light/schedules/${scheduleId}`)
      await set(scheduleRef, null)
    } catch (error) {
      console.error('Lỗi khi xóa hẹn giờ:', error)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Banner thương hiệu ở trên cùng */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-2xl p-4 mb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-yellow-900 font-bold text-xl md:text-2xl">
              Bytra Official
            </div>
            <a 
              href="tel:0968384643" 
              className="flex items-center gap-2 bg-yellow-900 text-yellow-100 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-800 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>0968384643</span>
            </a>
          </div>
        </div>

        {/* Header với thời gian */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            Smart Light Control
          </h1>
          <div className="text-center">
            <div className="text-yellow-400 text-lg md:text-xl font-semibold">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Panel điều khiển */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
            <div className="flex flex-col items-center space-y-6">
              {/* Icon đèn */}
              <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                lightStatus 
                  ? 'bg-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.8)]' 
                  : 'bg-gray-700 shadow-lg'
              }`}>
                <svg 
                  className={`w-16 h-16 transition-all duration-300 ${
                    lightStatus ? 'text-yellow-900' : 'text-gray-500'
                  }`}
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.5 7 11.35 7 10c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.35-.8 2.5-2.15 3.1z"/>
                </svg>
              </div>

              {/* Trạng thái */}
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Trạng thái</p>
                <p className={`text-2xl font-bold ${
                  lightStatus ? 'text-yellow-400' : 'text-gray-500'
                }`}>
                  {lightStatus ? 'BẬT' : 'TẮT'}
                </p>
              </div>

              {/* Nút bật/tắt */}
              <button
                onClick={toggleLight}
                className={`w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  lightStatus
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900 shadow-lg shadow-yellow-500/50'
                    : 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg'
                }`}
              >
                {lightStatus ? 'TẮT ĐÈN' : 'BẬT ĐÈN'}
              </button>
            </div>

            {/* Hẹn giờ */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h2 className="text-white font-semibold text-lg mb-4">Hẹn giờ</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <select
                    value={scheduleAction}
                    onChange={(e) => setScheduleAction(e.target.value)}
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="on">Bật</option>
                    <option value="off">Tắt</option>
                  </select>
                  <button
                    onClick={addSchedule}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-semibold rounded-lg transition-colors"
                  >
                    Thêm
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                      <span className="text-white text-sm">
                        {schedule.time} - {schedule.action === 'on' ? 'Bật' : 'Tắt'}
                      </span>
                      <button
                        onClick={() => deleteSchedule(schedule.id)}
                        className="text-red-400 hover:text-red-500 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Panel lịch sử */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-4">Lịch sử</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Chưa có lịch sử</p>
              ) : (
                history.map((item, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${
                        item.action === 'BẬT' ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {item.action}
                      </span>
                      <span className="text-gray-400 text-xs">{item.type}</span>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">{item.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

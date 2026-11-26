// Device frames for the live demos: a phone and a browser window.
export function Phone({ children }) {
  return (
    <div className="device-phone">
      <div className="device-phone__frame">
        <span className="device-phone__btn b1" aria-hidden="true" />
        <span className="device-phone__btn b2" aria-hidden="true" />
        <span className="device-phone__btn b3" aria-hidden="true" />
        <div className="device-phone__screen">
          <div className="device-phone__status" aria-hidden="true">
            <span>9:41</span>
            <span className="device-phone__island" />
            <span className="device-phone__icons"><i /><i /><b /></span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export function Browser({ url, children }) {
  return (
    <div className="device-browser">
      <div className="device-browser__bar" aria-hidden="true">
        <span className="dots"><i /><i /><i /></span>
        <span className="url">{url}</span>
      </div>
      <div className="device-browser__body">{children}</div>
    </div>
  )
}

export function ModeBadge({ live, liveText, offText }) {
  return (
    <span className={`mode ${live ? 'is-live' : ''}`}>
      <i />
      {live ? liveText : offText}
    </span>
  )
}

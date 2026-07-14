class SendData{
    private _data: any[] = []
    private _error?: string[]
    public _status: number = 200
    public send = () => ({status: this._status, error: this._error, data: this._data})

    public data(data: any){
        this._data.push(data);
        return this
    }

    public err(err: string){
        if(!this._error) this._error = []
        if(this._status == 200){
            this._status = 400
        }
        this._error.push(err)
        return this
    }

    public status(status: number){
        this._status = status
        return this
    }

    public replace(data: any){
        this._data = data
    }
}

export default SendData;
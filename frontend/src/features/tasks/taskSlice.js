import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import taskHelper from "./taskHelper";

const initialState = {
  tasks: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  filter: [],
  message: "",
}

export const getTasks = createAsyncThunk('tasks/get', (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().user.user.token

    return taskHelper.getTasks(token)
  } catch (error) {
    thunkAPI.rejectWithValue(error.toString())
  }
})

export const addTask = createAsyncThunk('tasks/create', async(taskData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().user.user.token
    return await taskHelper.addTask(taskData, token)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.toString())
  }
})

export const removeTask = createAsyncThunk('tasks/deleteTask', async (taskId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().user.user.token

    return await taskHelper.removeTask(taskId, token)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.toString())
  }
})

export const updatedTask = createAsyncThunk('tasks/updateTask', async ({taskId, taskData}, thunkAPI) => {
  try {
    const token = thunkAPI.getState().user.user.token

    return await taskHelper.updatedTask(taskId, taskData, token)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.toString())
  }
})

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    reset: (state) => {
      state = initialState
    },
    favTasks: (state) => {
      if (state.tasks) {
        return {
          ...state,
          tasks: state.tasks.filter((task) => task.favorite === true),
        };
      } else {
        return state;
      }
    },
    filterTask: (state, action) => {
      const control = [...state.filter];
      state.tasks = control

      
      const filteredtask = state.tasks
      .filter((task) => {
          const filterComplete = action.payload.isComplete ? task.taskCompleted === action.payload.isComplete :
          task
          const filterFavorite = action.payload.isFavorite ? task.favorite === action.payload.isFavorite :
          task

          const filterPriority = task.priority === action.payload.priorityFilter
         return filterComplete && filterFavorite && filterPriority &&
         task.taskItem.toString().includes(action.payload.taskText)
        })

      state.tasks = filteredtask;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTasks.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.tasks = action.payload
        state.filter = action.payload
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(addTask.pending, (state) => {
        state.isLoading = true
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.tasks = action.payload
      })
      .addCase(addTask.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(removeTask.pending, (state) => {
        state.isLoading = false
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.tasks = state.tasks.filter((task) => {
          return task._id !== action.payload.id
        })
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updatedTask.pending, (state) => {
        state.isLoading = false
      })
      .addCase(updatedTask.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        const updatedTaskIndex = state.tasks.findIndex(task => task._id === action.payload._id);
        if (updatedTaskIndex !== -1) {
          state.tasks[updatedTaskIndex] = action.payload;
        }
      })
      .addCase(updatedTask.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  }
})

export const {reset, favTasks, filterTask} = taskSlice.actions
export default taskSlice.reducer

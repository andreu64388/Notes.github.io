
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TagsState {
  tags: string[];
}

const initialState: TagsState = {
  tags: [],
};

const tagsSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {
    addTag: (state, action: PayloadAction<string>) => {
      state.tags.push(action.payload);
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload;
    },
  },
});

export const { addTag, setTags } = tagsSlice.actions;
export default tagsSlice.reducer;

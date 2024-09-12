import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ORDERS_URL } from "../constants/api.constants";

type OrderType = {
  id: string | number;
  username?: string;
  status?: string;
  createdAt?: string;
};

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  tagTypes: ["Orders"],
  baseQuery: fetchBaseQuery({
    baseUrl: ORDERS_URL,
  }),
  endpoints: (build) => ({
    getOrders: build.query({
      query: (limit = "") => `/orders${limit && `/${limit}`}`,
      providesTags: (result) => {
        const orders = Array.isArray(result) ? result : result ? [result] : [];
        return [
          ...orders.map(({ id }: OrderType) => ({
            type: "Orders" as const,
            id,
          })),
          { type: "Orders", id: "LIST" },
        ];
      },
    }),

    addOrder: build.mutation({
      query: (body) => ({
        url: "orders",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Orders", id: "LIST" }],
    }),

    updateOrder: build.mutation({
      query: ({ id, ...body }: OrderType) => ({
        url: `orders/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Orders", id }],
    }),

    deleteOrder: build.mutation({
      query: (id) => ({
        url: `orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Orders", id: "LIST" }],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useAddOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersApi;
